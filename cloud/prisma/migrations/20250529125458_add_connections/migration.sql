-- CreateEnum
CREATE TYPE "Engine" AS ENUM ('mysql', 'postgres', 'sqlite');

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "database" TEXT NOT NULL,
    "dbUser" TEXT,
    "encryptCredentials" BOOLEAN NOT NULL,
    "engine" "Engine" NOT NULL,
    "host" TEXT,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "port" INTEGER,
    "schema" TEXT,
    "sshHost" TEXT,
    "sshPassword" TEXT,
    "sshPort" INTEGER,
    "sshPrivateKey" TEXT,
    "sshUser" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
