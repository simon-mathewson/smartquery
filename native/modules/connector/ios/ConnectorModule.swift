import ExpoModulesCore
import PostgresClientKit

internal struct Connector {
  let postgresPool: PostgresClientKit.ConnectionPool?
  let mysqlPool: MySQL.ConnectionPool?
  let sshClient: Ssh.Client?
}


public class ConnectorModule: Module {
  private var connectors: [String: Connector] = [:]

  public func definition() -> ModuleDefinition {
    Name("Connector")

    AsyncFunction("connectDb") { (props: [String: Any]) in
      var host = props["host"] as! String
      var port = props["port"] as! Int

      var sshClient: Ssh.Client?
      
      if let sshValue = props["ssh"] as? [String: Any] {
        let sshHost = sshValue["host"] as! String
        let sshPort = sshValue["port"] as! Int
        let sshUser = sshValue["user"] as! String
        let sshPassword = sshValue["password"] as? String ?? ""
        
        let remoteHost = host
        let remotePort = port
        
        sshClient = Ssh.Client()
        let result = try await sshClient!.forward(
          sshHost: sshHost,
          sshPort: sshPort,
          sshUser: sshUser,
          sshPassword: sshPassword,
          remoteHost: remoteHost,
          remotePort: remotePort
        )
        
        host = result.host
        port = result.port
      }
    
      let database = props["database"] as! String
      let user = props["user"] as! String
      let password = props["password"] as? String

      let connectorId = UUID().uuidString

      self.connectors[connectorId] = props["engine"] as! String == "mysql"
        ? Connector(
            postgresPool: nil,
            mysqlPool: try await connectMysql(host: host, port: port, database: database, user: user, password: password),
            sshClient: sshClient
          )
        : Connector(
            postgresPool: try await connectPostgres(host: host, port: port, database: database, user: user, password: password),
            mysqlPool: nil,
            sshClient: sshClient
          )

      return connectorId
    }

    Function("disconnectDb") { (connectorId: String) in
      guard let connector = self.connectors[connectorId] else {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Connector not found"])
      }

      connector.postgresPool?.close()
      connector.mysqlPool?.free(nil)
      
      connector.sshClient?.shutDown()
      
      self.connectors.removeValue(forKey: connectorId)
    }

    AsyncFunction("runQuery") { (props: [String: Any]) in
      let connectorId = props["connectorId"] as! String
      let statements = props["statements"] as! [String]

      guard let connector = self.connectors[connectorId] else {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Connector not found"])
      }

      return try await connector.postgresPool != nil
        ? runQueryPostgres(pool: connector.postgresPool!, statements: statements)
        : runQueryMysql(pool: connector.mysqlPool!, statements: statements)
    }
  }
}

private func connectPostgres(
  host: String,
  port: Int,
  database: String,
  user: String,
  password: String?,
  ssl: Bool = true,
  credential: PostgresClientKit.Credential? = nil
) async throws -> PostgresClientKit.ConnectionPool {
  var configuration = PostgresClientKit.ConnectionConfiguration()
  configuration.host = host
  configuration.database = database
  configuration.user = user
  configuration.credential = password == nil ? .trust : credential ?? .scramSHA256(password: password!)
  configuration.port = port
  configuration.ssl = ssl

  let poolConfiguration = PostgresClientKit.ConnectionPoolConfiguration()

  var postgresPool: PostgresClientKit.ConnectionPool
  do {
    postgresPool = try PostgresClientKit.ConnectionPool(
      connectionPoolConfiguration: poolConfiguration,
      connectionConfiguration: configuration
    )

    // Test connection
    try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
      postgresPool.withConnection { result in
        do {
          let connection = try result.get()
          continuation.resume()
        } catch {
          continuation.resume(throwing: error)
        }
      }
    }
  } catch PostgresClientKit.PostgresError.sslNotSupported {
    if !ssl {
      throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "No SSL retry failed"])
    }
    
    return try await connectPostgres(host: host, port: port, database: database, user: user, password: password, ssl: false, credential: credential)
  } catch PostgresClientKit.PostgresError.md5PasswordCredentialRequired {
    if case .md5Password(password: let password) = credential {
      throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "MD5 password retry failed"])
    }

    return try await connectPostgres(host: host, port: port, database: database, user: user, password: password, ssl: ssl, credential: PostgresClientKit.Credential.md5Password(password: password!))
  } catch PostgresClientKit.PostgresError.cleartextPasswordCredentialRequired {
    if case .cleartextPassword(password: let password) = credential {
      throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Cleartext password retry failed"])
    }

    return try await connectPostgres(host: host, port: port, database: database, user: user, password: password, ssl: ssl, credential: PostgresClientKit.Credential.cleartextPassword(password: password!))
  }

  return postgresPool
}

private func runQueryPostgres(pool: PostgresClientKit.ConnectionPool, statements: [String]) async throws -> [[String: Any]] {
  return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<[[String: Any]], Error>) in
    pool.withConnection { result in
      do {
        let connection = try result.get()
        var results: [[String: Any]] = []
        
        do {
          try connection.beginTransaction()
          
          for statement in statements {
            let parsedStatement = try connection.prepareStatement(text: statement)
            defer { parsedStatement.close() }

            let cursor = try parsedStatement.execute(retrieveColumnMetadata: true)
            defer { cursor.close() }
            
            let columns = (cursor.columns ?? []).map { column in
              column.columnAttributeNumber == 0
                ? [
                  "name": column.name,
                  "type": "virtual"
                ]
                : [
                  "name": column.name,
                  "ref": [
                    "columnId": column.columnAttributeNumber,
                    "tableId": column.tableOID
                  ],
                  "type": "column"
                ]
            }
            var rows: [[String?]] = []

            for row in cursor {
              let values = try row.get().columns.map { $0.rawValue }
              rows.append(values)
            }
            
            results.append([
              "fields": columns,
              "rows": rows
            ])
          }

          try connection.commitTransaction()
          continuation.resume(returning: results)
        } catch {
          try? connection.rollbackTransaction()
          continuation.resume(throwing: error)
        }
      } catch {
        continuation.resume(throwing: error)
      }
    }
  }
}

private func connectMysql(host: String, port: Int, database: String, user: String, password: String?) async throws -> MySQL.ConnectionPool {
  let connection = try MySQL.Connection()

  // Test connection
  try connection.open(addr: host, user: user, passwd: password, dbname: database, port: port)
  try connection.close()
  
  let pool = try MySQL.ConnectionPool(num: 10, connection: connection)

  return pool
}

private func runQueryMysql(pool: MySQL.ConnectionPool, statements: [String]) async throws -> [[String: Any]] {
  guard let connection = pool.getConnection() else {
    throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to get connection"])
  }

  var results: [[String: Any]] = []

  try connection.query("START TRANSACTION")
  
  do {
    for statement in statements {
      let result = try connection.query(statement)
      let rows = try result.readAllRows()?.first

      if rows == nil || connection.columns == nil {
        results.append([
          "columns": [],
          "rows": []
        ])
        continue
      }

      let columns = connection.columns!.map { column in
        column.origName.count > 0 ? [
          "type": "column",
          "name": column.name,
          "ref": [
            "column": column.origName,
            "schema": column.database,
            "table": column.originalTableName
          ]
        ] : [
          "type": "virtual",
          "name": column.name
        ]
      }
      
      results.append([
        "fields": columns,
        "rows": rows
      ])
    }

    try connection.query("COMMIT")
  } catch {
    try connection.query("ROLLBACK")
    throw error
  }

  pool.free(connection)

  return results
}
