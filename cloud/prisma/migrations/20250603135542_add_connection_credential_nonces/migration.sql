-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "passwordNonce" TEXT,
ADD COLUMN     "sshPasswordNonce" TEXT,
ADD COLUMN     "sshPrivateKeyNonce" TEXT;
