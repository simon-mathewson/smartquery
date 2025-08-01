/*
  Warnings:

  - You are about to drop the column `subscription` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('plus');

-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('aiChatInputTokens', 'aiChatOutputTokens', 'aiInlineCompletionInputTokens', 'aiInlineCompletionOutputTokens', 'queryDurationSeconds', 'queryResponseBytes');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "subscription";

-- DropEnum
DROP TYPE "Subscription";

-- CreateTable
CREATE TABLE "Subscription" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" DATE NOT NULL,
    "type" "SubscriptionType" NOT NULL,
    "userId" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "Usage" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "UsageType" NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Usage_userId_type_createdAt_idx" ON "Usage"("userId", "type", "createdAt");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Subscription"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
