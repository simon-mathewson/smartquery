import ExpoModulesCore
import PostgresClientKit

internal struct Connector {
  let postgresPool: PostgresClientKit.ConnectionPool?
  let mysqlPool: MySQL.ConnectionPool?
  let sshClient: Ssh.Client?
  let connection: [String: Any]
}


public class ConnectorModule: Module {
  private var connectors: [String: Connector] = [:]

  public func definition() -> ModuleDefinition {
    Name("Connector")

    Constant("isIosOnMac") {
      ProcessInfo.processInfo.isiOSAppOnMac
    }

    Function("writeToClipboard") { (text: String) in
      UIPasteboard.general.string = text
    }

    AsyncFunction("connectDb") { (props: [String: Any]) in
      var host = props["host"] as! String
      var port = props["port"] as! Int

      var sshClient: Ssh.Client?
      
      if let sshValue = props["ssh"] as? [String: Any] {
        let sshHost = sshValue["host"] as! String
        let sshPort = sshValue["port"] as! Int
        let sshUser = sshValue["user"] as! String
        let sshPassword = sshValue["password"] as? String
        let sshPrivateKey = sshValue["privateKey"] as? String
        let sshPrivateKeyPassphrase = sshValue["privateKeyPassphrase"] as? String
        
        let remoteHost = host
        let remotePort = port
        
        sshClient = Ssh.Client()
        let result = try await sshClient!.forward(
          sshHost: sshHost,
          sshPort: sshPort,
          sshUser: sshUser,
          sshPassword: sshPassword,
          sshPrivateKey: sshPrivateKey,
          sshPrivateKeyPassphrase: sshPrivateKeyPassphrase,
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

      do {
        self.connectors[connectorId] = props["engine"] as! String == "mysql"
          ? Connector(
              postgresPool: nil,
              mysqlPool: try await connectMysql(host: host, port: port, database: database, user: user, password: password),
              sshClient: sshClient,
              connection: props
            )
          : Connector(
              postgresPool: try await connectPostgres(host: host, port: port, database: database, user: user, password: password),
              mysqlPool: nil,
              sshClient: sshClient,
              connection: props
            )

        return connectorId
      } catch {
        print(error)
        // Postgres connection failed
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "CONNECTION_FAILED"])
      }
    }

    AsyncFunction("switchCatalogOrSchema") { (connectorId: String, catalog: String?, schema: String?) in
      guard let connector = self.connectors[connectorId] else {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "CONNECTOR_NOT_FOUND"])
      }

      let engine = connector.connection["engine"] as! String

      if engine == "mysql" {
        if catalog != nil {
          throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Can't switch catalog for MySQL"])
        }

        guard let schema = schema else {
          throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Schema is required for switching schema for MySQL"])
        }

        guard let mysqlPool = connector.mysqlPool else {
          throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "MySQL pool not found"])
        }

        guard let connection = mysqlPool.getConnection() else {
          throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to get connection"])
        }

        do {
          try connection.query("USE \(schema)")
          mysqlPool.free(connection)

          var updatedConnection = connector.connection
          updatedConnection["database"] = schema

          self.connectors[connectorId] = Connector(
            postgresPool: nil,
            mysqlPool: mysqlPool,
            sshClient: connector.sshClient,
            connection: updatedConnection
          )
        } catch {
          mysqlPool.free(connection)
          throw error
        }
      } else {
        // Postgres
        if let catalog = catalog {
          // Disconnect current connection
          connector.postgresPool?.close()
          connector.sshClient?.shutDown()

          // Extract connection details
          var host = connector.connection["host"] as! String
          var port = connector.connection["port"] as! Int
          let user = connector.connection["user"] as! String
          let password = connector.connection["password"] as? String

          var sshClient: Ssh.Client?

          // Re-establish SSH tunnel if needed
          if let sshValue = connector.connection["ssh"] as? [String: Any] {
            let sshHost = sshValue["host"] as! String
            let sshPort = sshValue["port"] as! Int
            let sshUser = sshValue["user"] as! String
            let sshPassword = sshValue["password"] as? String
            let sshPrivateKey = sshValue["privateKey"] as? String
            let sshPrivateKeyPassphrase = sshValue["privateKeyPassphrase"] as? String

            let remoteHost = host
            let remotePort = port

            sshClient = Ssh.Client()
            let result = try await sshClient!.forward(
              sshHost: sshHost,
              sshPort: sshPort,
              sshUser: sshUser,
              sshPassword: sshPassword,
              sshPrivateKey: sshPrivateKey,
              sshPrivateKeyPassphrase: sshPrivateKeyPassphrase,
              remoteHost: remoteHost,
              remotePort: remotePort
            )

            host = result.host
            port = result.port
          }

          // Create new connection with new database
          let postgresPool = try await connectPostgres(host: host, port: port, database: catalog, user: user, password: password)

          var updatedConnection = connector.connection
          updatedConnection["database"] = catalog
          if let schema = schema {
            updatedConnection["schema"] = schema
          }

          self.connectors[connectorId] = Connector(
            postgresPool: postgresPool,
            mysqlPool: nil,
            sshClient: sshClient,
            connection: updatedConnection
          )
        } else {
          guard let schema = schema else {
            throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Either catalog or schema is required to switch catalog/schema for Postgres"])
          }

          guard let postgresPool = connector.postgresPool else {
            throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Postgres pool not found"])
          }

          // Execute SET search_path query
          try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            postgresPool.withConnection { result in
              do {
                let connection = try result.get()
                let setSearchPathStatement = try connection.prepareStatement(text: "SET search_path TO \(schema)")
                defer { setSearchPathStatement.close() }
                try setSearchPathStatement.execute()
                continuation.resume()
              } catch {
                continuation.resume(throwing: error)
              }
            }
          }

          // Update connection dictionary
          var updatedConnection = connector.connection
          updatedConnection["schema"] = schema

          self.connectors[connectorId] = Connector(
            postgresPool: postgresPool,
            mysqlPool: nil,
            sshClient: connector.sshClient,
            connection: updatedConnection
          )
        }
      }
    }

    Function("disconnectDb") { (connectorId: String) in
      guard let connector = self.connectors[connectorId] else {
        return
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
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "CONNECTOR_NOT_FOUND"])
      }

      do {
        let results = try await connector.postgresPool != nil
          ? runQueryPostgres(pool: connector.postgresPool!, statements: statements, connectionProps: connector.connection)
          : runQueryMysql(pool: connector.mysqlPool!, statements: statements)
        return results
      } catch Socket.SocketError.recvFailed {
        // MySQL no longer connected
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "NO_LONGER_CONNECTED"])
      } catch MySQL.MySQLError.error(let code, let message) {
        // Extract user-friendly error message from MySQL error
        let errorMessage = message.isEmpty ? "Database query failed" : message
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: errorMessage])
      } catch MySQL.Connection.ConnectionError.addressNotSet {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Database address is not set"])
      } catch MySQL.Connection.ConnectionError.usernameNotSet {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Database username is not set"])
      } catch MySQL.Connection.ConnectionError.notConnected {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Not connected to database"])
      } catch MySQL.Connection.ConnectionError.statementPrepareError(let error) {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to prepare statement: \(error)"])
      } catch MySQL.Connection.ConnectionError.dataReadingError {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Error reading data from database"])
      } catch MySQL.Connection.ConnectionError.queryInProgress {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "A query is already in progress"])
      } catch MySQL.Connection.ConnectionError.wrongHandshake {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Database handshake failed"])
      } catch PostgresClientKit.PostgresError.sqlError(let notice) where notice.code == "57P01" && notice.message == "terminating connection due to administrator command" {
        // Postgres no longer connected
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "NO_LONGER_CONNECTED"])
      } catch PostgresClientKit.PostgresError.sqlError(let notice) {
        // Extract user-friendly error message from PostgreSQL notice
        let errorMessage: String
        if let message = notice.message, !message.isEmpty {
          errorMessage = message
        } else {
          errorMessage = "Database query failed"
        }
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: errorMessage])
      } catch PostgresClientKit.PostgresError.sslNotSupported {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "SSL connection is not supported by the server"])
      } catch PostgresClientKit.PostgresError.md5PasswordCredentialRequired {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "MD5 password authentication is required"])
      } catch PostgresClientKit.PostgresError.cleartextPasswordCredentialRequired {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Cleartext password authentication is required"])
      } catch PostgresClientKit.PostgresError.columnMetadataNotAvailable {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Column metadata is not available"])
      } catch PostgresClientKit.PostgresError.connectionClosed {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Connection is closed"])
      } catch PostgresClientKit.PostgresError.connectionPoolClosed {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Connection pool is closed"])
      } catch PostgresClientKit.PostgresError.cursorClosed {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Cursor is closed"])
      } catch PostgresClientKit.PostgresError.invalidParameterValue(let name, let value, let allowedValues) {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid parameter value for '\(name)': '\(value)'. Allowed values: \(allowedValues.joined(separator: ", "))"])
      } catch PostgresClientKit.PostgresError.invalidUsernameString {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid username format"])
      } catch PostgresClientKit.PostgresError.invalidPasswordString {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid password format"])
      } catch PostgresClientKit.PostgresError.scramSHA256CredentialRequired {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "SCRAM-SHA-256 authentication is required"])
      } catch PostgresClientKit.PostgresError.serverError(let description) {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: description])
      } catch PostgresClientKit.PostgresError.socketError {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "NO_LONGER_CONNECTED"])
      } catch PostgresClientKit.PostgresError.sslError(let cause) {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "SSL/TLS error: \(cause.localizedDescription)"])
      } catch PostgresClientKit.PostgresError.statementClosed {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Statement is closed"])
      } catch PostgresClientKit.PostgresError.timedOutAcquiringConnection {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Connection request timed out"])
      } catch PostgresClientKit.PostgresError.tooManyRequestsForConnections {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Too many connection requests"])
      } catch PostgresClientKit.PostgresError.trustCredentialRequired {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Trust authentication is required"])
      } catch PostgresClientKit.PostgresError.unsupportedAuthenticationType(let authenticationType) {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Unsupported authentication type: \(authenticationType)"])
      } catch PostgresClientKit.PostgresError.valueConversionError(let value, let type) {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Value conversion error: cannot convert to \(type)"])
      } catch PostgresClientKit.PostgresError.valueIsNil {
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Value is nil"])
      } catch {
        // For any other PostgresError or unknown errors, try to extract a meaningful message
        if let postgresError = error as? PostgresClientKit.PostgresError {
          let errorDescription = String(describing: postgresError)
          throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: errorDescription])
        }
        
        // For other errors, use the error's description if available
        let nsError = error as NSError
        let errorMessage = nsError.localizedDescription.isEmpty 
          ? "An unexpected error occurred"
          : nsError.localizedDescription
        throw NSError(domain: "ConnectorModule", code: 1, userInfo: [NSLocalizedDescriptionKey: errorMessage])
      }
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

private func runQueryPostgres(pool: PostgresClientKit.ConnectionPool, statements: [String], connectionProps: [String: Any]) async throws -> [[String: Any]] {
  return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<[[String: Any]], Error>) in
    pool.withConnection { result in
      do {
        let connection = try result.get()
        var results: [[String: Any]] = []
        
        do {
          if let schema = connectionProps["schema"] as? String {
            let setSearchPathStatement = try connection.prepareStatement(text: "SET search_path TO \(schema)")
            defer { setSearchPathStatement.close() }
            try setSearchPathStatement.execute()
          }
          
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
