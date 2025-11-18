import ExpoModulesCore
import PostgresClientKit

internal struct Connector {
  let postgresPool: PostgresClientKit.ConnectionPool?
  let mysqlPool: MySQL.ConnectionPool?
}

public class ConnectorModule: Module {
  private var connectors: [String: Connector] = [:]

  public func definition() -> ModuleDefinition {
    Name("Connector")

    AsyncFunction("connectDb") { (props: [String: Any]) in    
      if let sshValue = props["ssh"], sshValue is [String: Any] {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "SSH is not supported"])
      }
    
      let host = props["host"] as! String
      let port = props["port"] as! Int
      let database = props["database"] as! String
      let user = props["user"] as! String
      let password = props["password"] as? String

      let connectorId = UUID().uuidString

      self.connectors[connectorId] = props["engine"] as! String == "mysql"
        ? Connector(postgresPool: nil, mysqlPool: try await connectMysql(host: host, port: port, database: database, user: user, password: password))
        : Connector(postgresPool: try await connectPostgres(host: host, port: port, database: database, user: user, password: password), mysqlPool: nil)

      return connectorId
    }

    Function("disconnectDb") { (connectorId: String) in
      guard let connector = self.connectors[connectorId] else {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Connector not found"])
      }

      connector.postgresPool?.close()
      connector.mysqlPool?.free(nil)
      
      self.connectors.removeValue(forKey: connectorId)
    }

    AsyncFunction("runQuery") { (connectorId: String, statements: [String]) in
      guard let connector = self.connectors[connectorId] else {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Connector not found"])
      }

      return try await connector.postgresPool != nil
        ? runQueryPostgres(pool: connector.postgresPool!, statements: statements)
        : runQueryMysql(pool: connector.mysqlPool!, statements: statements)
    }
  }
}

private func connectPostgres(host: String, port: Int, database: String, user: String, password: String?) async throws -> PostgresClientKit.ConnectionPool {
  var configuration = PostgresClientKit.ConnectionConfiguration()
  configuration.host = host
  configuration.database = database
  configuration.user = user
  configuration.credential = password == nil ? .trust : .scramSHA256(password: password!)
  configuration.port = port
  configuration.ssl = true

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
    // Retry with SSL disabled
    configuration.ssl = false
    postgresPool = try PostgresClientKit.ConnectionPool(
      connectionPoolConfiguration: poolConfiguration,
      connectionConfiguration: configuration
    )
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
              "columns": columns,
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

  for statement in statements {
    let prepared = try connection.prepare(statement)
    let result = try prepared.query([])
    let rows = try result.readAllRows()

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
      "columns": columns,
      "rows": rows
    ])
  }

  pool.free(connection)

  return results
}
