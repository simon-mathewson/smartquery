/*
  Warnings:

  - The values [sqlite] on the enum `Engine` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Engine_new" AS ENUM ('mysql', 'postgres');
ALTER TABLE "Connection" ALTER COLUMN "engine" TYPE "Engine_new" USING ("engine"::text::"Engine_new");
ALTER TYPE "Engine" RENAME TO "Engine_old";
ALTER TYPE "Engine_new" RENAME TO "Engine";
DROP TYPE "Engine_old";
COMMIT;
