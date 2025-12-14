import Foundation
import NIO
import NIOSSH

// MARK: - SSH <-> ByteBuffer wrapper for forwarded channels

final class SSHWrapperHandler: ChannelDuplexHandler {
    typealias InboundIn = SSHChannelData
    typealias InboundOut = ByteBuffer
    typealias OutboundIn = ByteBuffer
    typealias OutboundOut = SSHChannelData

    func channelRead(context: ChannelHandlerContext, data: NIOAny) {
        let msg = self.unwrapInboundIn(data)
        guard case .channel = msg.type,
              case .byteBuffer(let buf) = msg.data
        else {
            return
        }
        context.fireChannelRead(self.wrapInboundOut(buf))
    }

    func write(context: ChannelHandlerContext, data: NIOAny, promise: EventLoopPromise<Void>?) {
        let buf = self.unwrapOutboundIn(data)
        let wrapped = SSHChannelData(type: .channel, data: .byteBuffer(buf))
        context.write(self.wrapOutboundOut(wrapped), promise: promise)
    }
}

