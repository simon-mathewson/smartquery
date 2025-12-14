import Foundation
import NIO

final class ErrorHandler: ChannelInboundHandler {
    typealias InboundIn = Any

    func errorCaught(context: ChannelHandlerContext, error: Error) {
        fputs("Pipeline error: \(error)\n", stderr)
        context.close(promise: nil)
    }
}

