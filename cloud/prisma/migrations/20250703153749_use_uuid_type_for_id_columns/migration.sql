-- Add new UUID columns
ALTER TABLE
  "User"
ADD
  COLUMN "id_new" UUID;

ALTER TABLE
  "Connection"
ADD
  COLUMN "id_new" UUID;

ALTER TABLE
  "Connection"
ADD
  COLUMN "userId_new" UUID;

-- Copy data from old columns to new columns
UPDATE
  "User"
SET
  "id_new" = "id" :: UUID;

UPDATE
  "Connection"
SET
  "id_new" = "id" :: UUID;

UPDATE
  "Connection"
SET
  "userId_new" = "userId" :: UUID;

-- Make all new columns NOT NULL after data is copied
ALTER TABLE
  "Connection"
ALTER COLUMN
  "userId_new"
SET
  NOT NULL;

ALTER TABLE
  "User"
ALTER COLUMN
  "id_new"
SET
  NOT NULL;

ALTER TABLE
  "Connection"
ALTER COLUMN
  "id_new"
SET
  NOT NULL;

-- Drop foreign key constraint
ALTER TABLE
  "Connection" DROP CONSTRAINT "Connection_userId_fkey";

-- Drop old columns
ALTER TABLE
  "Connection" DROP COLUMN "id";

ALTER TABLE
  "Connection" DROP COLUMN "userId";

ALTER TABLE
  "User" DROP COLUMN "id";

-- Rename new columns to original names
ALTER TABLE
  "User" RENAME COLUMN "id_new" TO "id";

ALTER TABLE
  "Connection" RENAME COLUMN "id_new" TO "id";

ALTER TABLE
  "Connection" RENAME COLUMN "userId_new" TO "userId";

-- Add primary key constraints
ALTER TABLE
  "User"
ADD
  PRIMARY KEY ("id");

ALTER TABLE
  "Connection"
ADD
  PRIMARY KEY ("id");

-- Recreate foreign key constraint
ALTER TABLE
  "Connection"
ADD
  CONSTRAINT "Connection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
