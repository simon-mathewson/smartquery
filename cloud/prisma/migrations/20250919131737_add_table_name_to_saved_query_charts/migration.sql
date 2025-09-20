/*
  Warnings:

  - You are about to drop the column `x` on the `SavedQueryChart` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `SavedQueryChart` table. All the data in the column will be lost.
  - Added the required column `xColumn` to the `SavedQueryChart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SavedQueryChart" DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "xColumn" TEXT NOT NULL,
ADD COLUMN     "xTable" TEXT,
ADD COLUMN     "yColumn" TEXT,
ADD COLUMN     "yTable" TEXT;
