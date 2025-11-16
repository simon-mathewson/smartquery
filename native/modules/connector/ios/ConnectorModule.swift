import ExpoModulesCore
import PostgresClientKit

internal struct Connector {
  let connection: PostgresClientKit.Connection
  let sshTunnel: Any?
}

public class ConnectorModule: Module {
  private var connectors: [String: Connector] = [:]

  public func definition() -> ModuleDefinition {
    Name("Connector")

    AsyncFunction("connectDb") { (props: [String: Any]) in
      let remoteHost = props["host"] as! String
      let remotePort = props["port"] as! Int
      let database = props["database"] as! String
      let user = props["user"] as! String
      let password = props["password"] as? String
      
      var host = remoteHost
      var port = remotePort
      
      var configuration = PostgresClientKit.ConnectionConfiguration()
      configuration.host = host
      configuration.database = database
      configuration.user = user
      configuration.credential = password == nil ? .trust : .scramSHA256(password: password!)
      configuration.port = port
      configuration.ssl = false

      let connection = try PostgresClientKit.Connection(configuration: configuration)
      
      let connectorId = UUID().uuidString
      self.connectors[connectorId] = Connector(connection: connection, sshTunnel: nil)

      return connectorId
    }
  }
}
