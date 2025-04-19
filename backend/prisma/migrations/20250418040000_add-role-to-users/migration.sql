-- Add the `password` column with a default value for existing rows
-- ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT 'default_password';

-- Remove the default value after updating existing rows
-- ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;