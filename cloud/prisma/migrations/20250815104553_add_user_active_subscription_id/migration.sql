/*
  Warnings:

  - A unique constraint covering the columns `[activeSubscriptionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeSubscriptionId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "User_activeSubscriptionId_key" ON "User"("activeSubscriptionId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeSubscriptionId_fkey" FOREIGN KEY ("activeSubscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Set active subscription for existing users
UPDATE "User" SET "activeSubscriptionId" = (
  SELECT "id" FROM "Subscription" WHERE "userId" = "User"."id"
);