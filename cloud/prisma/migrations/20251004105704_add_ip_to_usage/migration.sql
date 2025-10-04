-- AlterTable
ALTER TABLE "Usage" ADD COLUMN     "ip" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Usage_ip_type_createdAt_idx" ON "Usage"("ip", "type", "createdAt");
