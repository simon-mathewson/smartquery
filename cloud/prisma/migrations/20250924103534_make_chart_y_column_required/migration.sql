/*
  Warnings:

  - Made the column `yColumn` on table `SavedQueryChart` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SavedQueryChart" ALTER COLUMN "yColumn" SET NOT NULL;
