/*
  Warnings:

  - The values [aiChatInputTokens,aiChatOutputTokens,aiInlineCompletionInputTokens,aiInlineCompletionOutputTokens] on the enum `UsageType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
DELETE FROM "Usage" WHERE "type" IN ('aiChatInputTokens', 'aiChatOutputTokens', 'aiInlineCompletionInputTokens', 'aiInlineCompletionOutputTokens');
CREATE TYPE "UsageType_new" AS ENUM ('aiCredits', 'queryDurationMilliseconds', 'queryResponseBytes');
ALTER TABLE "Usage" ALTER COLUMN "type" TYPE "UsageType_new" USING ("type"::text::"UsageType_new");
ALTER TYPE "UsageType" RENAME TO "UsageType_old";
ALTER TYPE "UsageType_new" RENAME TO "UsageType";
DROP TYPE "UsageType_old";
COMMIT;
