import Foundation
import NIO
import Crypto
import NIOSSH
import Citadel

/// OpenSSH private key parser using Citadel
/// Supports Ed25519 and RSA keys with optional passphrase
enum OpenSSHKeyParser {
    enum ParseError: Error, LocalizedError {
        case invalidKeyFormat
        case unsupportedKeyType(String)
        case decryptionFailed
        case unsupportedBCryptConfig
        
        var errorDescription: String? {
            switch self {
            case .invalidKeyFormat:
                return "Invalid OpenSSH key format"
            case .unsupportedKeyType(let type):
                return "Unsupported key type: \(type)"
            case .decryptionFailed:
                return "Key decryption failed - incorrect passphrase or corrupted key"
            case .unsupportedBCryptConfig:
                return "Key uses unsupported bcrypt configuration (rounds >= 18). Please re-encrypt the key with fewer rounds."
            }
        }
    }
    
    /// Parses an OpenSSH private key string and returns a NIOSSHPrivateKey
    /// Supports Ed25519 and RSA keys with optional passphrase
    static func parsePrivateKey(_ keyString: String, passphrase: String? = nil) throws -> NIOSSHPrivateKey {
        let decryptionKey = passphrase?.data(using: .utf8)
        
        var ed25519Error: Error?
        var rsaError: Error?
        
        // Try Ed25519 first (most common)
        do {
            let ed25519Key = try Curve25519.Signing.PrivateKey(sshEd25519: keyString, decryptionKey: decryptionKey)
            return NIOSSHPrivateKey(ed25519Key: ed25519Key)
        } catch {
            ed25519Error = error
        }
        
        // If Ed25519 failed, try RSA
        do {
            let rsaKey = try Insecure.RSA.PrivateKey(sshRsa: keyString, decryptionKey: decryptionKey)
            return NIOSSHPrivateKey(custom: rsaKey)
        } catch {
            rsaError = error
        }
        
        // Both failed - determine the error
        if decryptionKey != nil {
            // Check if either error is a key type mismatch (invalidPublicKeyPrefix)
            // This happens when we try the wrong key type - it's not a decryption failure
            // We check the string representation since InvalidOpenSSHKey doesn't implement LocalizedError
            let ed25519ErrorStr: String = {
                if let error = ed25519Error {
                    return String(describing: error)
                }
                return ""
            }()
            let rsaErrorStr: String = {
                if let error = rsaError {
                    return String(describing: error)
                }
                return ""
            }()
            
            // Check for unsupported bcrypt configuration (rounds >= 18)
            let ed25519IsUnsupportedBCrypt = (ed25519Error as? InvalidOpenSSHKey) != nil && 
                                           ed25519ErrorStr.contains("BCryptConfig")
            let rsaIsUnsupportedBCrypt = (rsaError as? InvalidOpenSSHKey) != nil && 
                                         rsaErrorStr.contains("BCryptConfig")
            
            if ed25519IsUnsupportedBCrypt || rsaIsUnsupportedBCrypt {
                throw ParseError.unsupportedBCryptConfig
            }
            
            let ed25519IsKeyTypeMismatch = (ed25519Error as? InvalidOpenSSHKey) != nil && 
                                          (ed25519ErrorStr.contains("PublicKey") || ed25519ErrorStr.contains("Prefix"))
            let rsaIsKeyTypeMismatch = (rsaError as? InvalidOpenSSHKey) != nil && 
                                      (rsaErrorStr.contains("PublicKey") || rsaErrorStr.contains("Prefix"))
            
            // If both are key type mismatches, it's an unsupported key type
            if ed25519IsKeyTypeMismatch && rsaIsKeyTypeMismatch {
                throw ParseError.unsupportedKeyType("Unsupported key type")
            }
            
            // Check if either error indicates a decryption failure (invalidCheck)
            // invalidCheck happens when the key type matches but the checksum fails after decryption
            let ed25519IsDecryptionFailure = (ed25519Error as? InvalidOpenSSHKey) != nil && 
                                             !ed25519IsKeyTypeMismatch &&
                                             (ed25519ErrorStr.contains("Check") || ed25519ErrorStr.contains("invalidCheck"))
            let rsaIsDecryptionFailure = (rsaError as? InvalidOpenSSHKey) != nil && 
                                        !rsaIsKeyTypeMismatch &&
                                        (rsaErrorStr.contains("Check") || rsaErrorStr.contains("invalidCheck"))
            
            // If we detect a decryption failure, throw that error
            if ed25519IsDecryptionFailure || rsaIsDecryptionFailure {
                throw ParseError.decryptionFailed
            }
            
            // If we have a passphrase and at least one error is InvalidOpenSSHKey (but not a key type mismatch),
            // and we couldn't detect "Check", it might still be a decryption failure
            // This is a fallback - if the key type matched (not a mismatch) and we got InvalidOpenSSHKey, 
            // it's likely a decryption issue
            let ed25519IsInvalidKey = !ed25519IsKeyTypeMismatch && ed25519Error is InvalidOpenSSHKey
            let rsaIsInvalidKey = !rsaIsKeyTypeMismatch && rsaError is InvalidOpenSSHKey
            
            if ed25519IsInvalidKey || rsaIsInvalidKey {
                throw ParseError.decryptionFailed
            }
        }
        
        // Otherwise, it's an unsupported key type or invalid format
        throw ParseError.unsupportedKeyType("Unsupported key type or invalid format")
    }
}
