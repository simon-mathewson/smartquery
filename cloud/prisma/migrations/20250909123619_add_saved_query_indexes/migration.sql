-- CreateIndex
CREATE INDEX "SavedQuery_userId_idx" ON "SavedQuery"("userId");

-- CreateIndex
CREATE INDEX "SavedQuery_connectionId_idx" ON "SavedQuery"("connectionId");

-- CreateIndex
CREATE INDEX "SavedQuery_connectionId_database_idx" ON "SavedQuery"("connectionId", "database");
