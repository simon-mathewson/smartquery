-- CreateEnum
CREATE TYPE "ChartType" AS ENUM ('line');

-- CreateTable
CREATE TABLE "SavedQueryChart" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "savedQueryId" UUID NOT NULL,
    "type" "ChartType" NOT NULL,
    "x" TEXT NOT NULL,
    "y" TEXT NOT NULL,

    CONSTRAINT "SavedQueryChart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedQueryChart_savedQueryId_key" ON "SavedQueryChart"("savedQueryId");

-- CreateIndex
CREATE INDEX "SavedQueryChart_savedQueryId_idx" ON "SavedQueryChart"("savedQueryId");

-- AddForeignKey
ALTER TABLE "SavedQueryChart" ADD CONSTRAINT "SavedQueryChart_savedQueryId_fkey" FOREIGN KEY ("savedQueryId") REFERENCES "SavedQuery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
