-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "endDate" TIMESTAMP(3),
ALTER COLUMN "startDate" SET DATA TYPE TIMESTAMP(3);
