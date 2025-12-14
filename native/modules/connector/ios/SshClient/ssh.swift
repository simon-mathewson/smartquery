import Foundation
import NIO

public struct Ssh {
    public struct ForwardResult {
        public let host: String
        public let port: Int
        
        public init(host: String, port: Int) {
            self.host = host
            self.port = port
        }
    }
    
    open class Client {
        var sshConnection: Channel?
        var localServer: Channel?
        var eventLoopGroup: EventLoopGroup?
        
        public init() {}
    }
}

