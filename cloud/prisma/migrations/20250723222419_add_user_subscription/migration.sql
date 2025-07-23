-- CreateEnum
CREATE TYPE "Subscription" AS ENUM ('plus');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscription" "Subscription";
