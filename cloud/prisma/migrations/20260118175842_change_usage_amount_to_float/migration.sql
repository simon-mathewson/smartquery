-- AlterTable
ALTER TABLE "Usage" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- Divide all amounts by 10_000
UPDATE "Usage" SET "amount" = "amount" / 10000 WHERE "type" = 'aiCredits';
