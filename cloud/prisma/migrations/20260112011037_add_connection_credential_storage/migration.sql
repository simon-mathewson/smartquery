/*
  Warnings:

  - You are about to drop the column `encryptCredentials` on the `Connection` table. All the data in the column will be lost.
  - Added the required column `credentialStorage` to the `Connection` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CredentialStorage" AS ENUM ('encrypted', 'keychain', 'alwaysAsk', 'plain');

-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "credentialStorage" "CredentialStorage" NOT NULL DEFAULT 'alwaysAsk';

UPDATE "Connection" SET "credentialStorage" = 'encrypted' WHERE "encryptCredentials" = true;
UPDATE "Connection" SET "credentialStorage" = 'plain' WHERE "password" IS NOT NULL;

ALTER TABLE "Connection" DROP COLUMN "encryptCredentials";

-- AlterTable
ALTER TABLE "Connection" ALTER COLUMN "credentialStorage" DROP DEFAULT;
