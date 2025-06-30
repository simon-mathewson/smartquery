/*
  Warnings:

  - Made the column `dbUser` on table `Connection` required. This step will fail if there are existing NULL values in that column.
  - Made the column `host` on table `Connection` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `Connection` required. This step will fail if there are existing NULL values in that column.
  - Made the column `port` on table `Connection` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Connection" ALTER COLUMN "dbUser" SET NOT NULL,
ALTER COLUMN "host" SET NOT NULL,
ALTER COLUMN "port" SET NOT NULL;
