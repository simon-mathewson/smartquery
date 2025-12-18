import Foundation
import NIO
import NIOSSH

// MARK: - SSH auth delegates

/// Password auth delegate (non-interactive): reads username+password you pass in.
final class PasswordAuthDelegate: NIOSSHClientUserAuthenticationDelegate {
    private let username: String
    private let password: String

    init(username: String, password: String) {
        self.username = username
        self.password = password
    }

    func nextAuthenticationType(
        availableMethods: NIOSSHAvailableUserAuthenticationMethods,
        nextChallengePromise: EventLoopPromise<NIOSSHUserAuthenticationOffer?>
    ) {
        guard availableMethods.contains(.password) else {
            nextChallengePromise.succeed(nil)
            return
        }

        let offer = NIOSSHUserAuthenticationOffer(
            username: self.username,
            serviceName: "", // SwiftNIO SSH fills the right thing internally.
            offer: .password(.init(password: self.password))
        )
        nextChallengePromise.succeed(offer)
    }
}

/// Private key auth delegate: reads username+privateKey you pass in.
final class PrivateKeyAuthDelegate: NIOSSHClientUserAuthenticationDelegate {
    private let username: String
    private let privateKey: NIOSSHPrivateKey

    init(username: String, privateKey: NIOSSHPrivateKey) {
        self.username = username
        self.privateKey = privateKey
    }

    func nextAuthenticationType(
        availableMethods: NIOSSHAvailableUserAuthenticationMethods,
        nextChallengePromise: EventLoopPromise<NIOSSHUserAuthenticationOffer?>
    ) {
        guard availableMethods.contains(.publicKey) else {
            nextChallengePromise.succeed(nil)
            return
        }

        let offer = NIOSSHUserAuthenticationOffer(
            username: self.username,
            serviceName: "", // SwiftNIO SSH fills the right thing internally.
            offer: .privateKey(.init(privateKey: self.privateKey))
        )
        nextChallengePromise.succeed(offer)
    }
}

/// ⚠️ Demo only: accepts any host key.
final class AcceptAllHostKeysDelegate: NIOSSHClientServerAuthenticationDelegate {
    func validateHostKey(hostKey: NIOSSHPublicKey, validationCompletePromise: EventLoopPromise<Void>) {
        validationCompletePromise.succeed(())
    }
}

