/*
  Warnings:

  - The values [queryDurationMilliseconds,queryResponseBytes] on the enum `UsageType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[appleOriginalTransactionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UsageType_new" AS ENUM ('aiCredits');
ALTER TABLE "Usage" ALTER COLUMN "type" TYPE "UsageType_new" USING ("type"::text::"UsageType_new");
ALTER TYPE "UsageType" RENAME TO "UsageType_old";
ALTER TYPE "UsageType_new" RENAME TO "UsageType";
DROP TYPE "UsageType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "appleOriginalTransactionId" TEXT,
ADD COLUMN     "appleTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_appleOriginalTransactionId_key" ON "Subscription"("appleOriginalTransactionId");
