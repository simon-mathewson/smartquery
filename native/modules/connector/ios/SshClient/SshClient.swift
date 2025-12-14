import Foundation
import NIO
import NIOSSH

public extension Ssh.Client {
    func forward(
            sshHost: String,
            sshPort: Int,
            sshUser: String,
            sshPassword: String,
            remoteHost: String,
            remotePort: Int
        ) async throws -> Ssh.ForwardResult {
        let localBindHost = "127.0.0.1"  // Use IPv4 instead of IPv6 for better iOS compatibility
        let localBindPort = 0  // Use 0 to let system assign a port
        
        // Create event loop group for SSH connection
        self.eventLoopGroup = MultiThreadedEventLoopGroup(numberOfThreads: 1)
        let group = self.eventLoopGroup!
        
        // Create the SSH connection channel
        let sshBootstrap = ClientBootstrap(group: group)
          .channelInitializer { channel in
            // Allow half-closure: important for SSH forwarding semantics
            channel.setOption(ChannelOptions.allowRemoteHalfClosure, value: true).flatMap {
              let userAuth = PasswordAuthDelegate(username: sshUser, password: sshPassword)
              let serverAuth = AcceptAllHostKeysDelegate()
              
              let sshHandler = NIOSSHHandler(
                role: .client(.init(userAuthDelegate: userAuth, serverAuthDelegate: serverAuth)),
                allocator: channel.allocator,
                inboundChildChannelInitializer: nil
              )
              
              return channel.pipeline.addHandlers([sshHandler, ErrorHandler()])
            }
          }
          .channelOption(ChannelOptions.socketOption(.so_reuseaddr), value: 1)
          .channelOption(ChannelOptions.socketOption(.tcp_nodelay), value: 1)
        
        // Connect SSH channel
        self.sshConnection = try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Channel, Error>) in
          sshBootstrap.connect(host: sshHost, port: sshPort).whenComplete { result in
            switch result {
            case .success(let channel):
              continuation.resume(returning: channel)
            case .failure(let error):
              continuation.resume(throwing: error)
            }
          }
        }
        
        // Start local listener; for each inbound TCP connection, open SSH `.directTCPIP` and glue
        // Create default originator address (use IPv4)
        let defaultOriginatorAddress = try SocketAddress(ipAddress: "127.0.0.1", port: 0)
        
        self.localServer = try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Channel, Error>) in
          ServerBootstrap(group: group)
            .serverChannelOption(ChannelOptions.socketOption(.so_reuseaddr), value: 1)
            .childChannelInitializer { [weak self] inbound in
              guard let self = self else {
                return inbound.eventLoop.makeFailedFuture(NSError(domain: "SshClient", code: 1, userInfo: [NSLocalizedDescriptionKey: "SshClient deallocated"]))
              }
              return inbound.setOption(ChannelOptions.allowRemoteHalfClosure, value: true).flatMap {
                self.sshConnection!.pipeline.handler(type: NIOSSHHandler.self).flatMap { ssh in
                  let childPromise = inbound.eventLoop.makePromise(of: Channel.self)
                  
                  // direct-tcpip asks the SSH server to connect to (remoteHost:remotePort)
                  let direct = SSHChannelType.DirectTCPIP(
                    targetHost: remoteHost,
                    targetPort: remotePort,
                    originatorAddress: inbound.remoteAddress ?? defaultOriginatorAddress
                  )
                  
                  ssh.createChannel(childPromise, channelType: .directTCPIP(direct)) { child, channelType in
                    guard case .directTCPIP = channelType else {
                      return inbound.eventLoop.makeFailedFuture(NSError(domain: "SshClient", code: 1, userInfo: [NSLocalizedDescriptionKey: "SSH protocol violation: expected directTCPIP channel"]))
                    }
                    
                    let (a, b) = GlueHandler.matchedPair()
                    
                    // child: SSH child channel (SSHChannelData)
                    // inbound: local TCP channel (ByteBuffer)
                    return child.pipeline.addHandlers([SSHWrapperHandler(), a, ErrorHandler()]).flatMap {
                      inbound.pipeline.addHandlers([b, ErrorHandler()])
                    }
                  }
                  
                  return childPromise.futureResult.map { _ in }
                }
              }
            }
            .bind(host: localBindHost, port: localBindPort)
            .whenComplete { result in
              switch result {
              case .success(let channel):
                continuation.resume(returning: channel)
              case .failure(let error):
                continuation.resume(throwing: error)
              }
            }
        }
        
        // Get the actual port that was assigned
        let actualPort: Int
        if let localAddress = self.localServer?.localAddress {
          actualPort = localAddress.port ?? localBindPort
        } else {
          actualPort = localBindPort
        }
        
            return Ssh.ForwardResult(host: localBindHost, port: actualPort)
        }
    
    func shutDown() {
        // Close SSH connection and local server if they exist
        _ = self.localServer?.close()
        _ = self.sshConnection?.close()
        
        // Shutdown event loop group if it exists
        if let group = self.eventLoopGroup {
            try? group.syncShutdownGracefully()
        }
        
        self.sshConnection = nil
        self.localServer = nil
        self.eventLoopGroup = nil
    }
}

