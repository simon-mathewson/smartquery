/*
  Warnings:

  - The required column `id` was added to the `Subscription` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "Subscription_userId_key";

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id");

ALTER TABLE "Subscription" ALTER COLUMN "id" DROP DEFAULT;
