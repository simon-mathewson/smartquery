/*
  Warnings:

  - A unique constraint covering the columns `[connectionId,database,name]` on the table `SavedQuery` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "SavedQuery_userId_idx" ON "SavedQuery"("userId");

-- CreateIndex
CREATE INDEX "SavedQuery_connectionId_idx" ON "SavedQuery"("connectionId");

-- CreateIndex
CREATE INDEX "SavedQuery_connectionId_database_idx" ON "SavedQuery"("connectionId", "database");

-- CreateIndex
CREATE UNIQUE INDEX "SavedQuery_connectionId_database_name_key" ON "SavedQuery"("connectionId", "database", "name");
