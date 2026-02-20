-- Create enums for redirect match modes if missing.
DO $$ BEGIN
  CREATE TYPE "RedirectQueryMatch" AS ENUM (
    'exact',
    'ignore'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "RedirectPathMatch" AS ENUM (
    'exact',
    'prefix'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "RedirectRule"
  ADD COLUMN IF NOT EXISTS "queryMatch" "RedirectQueryMatch" NOT NULL DEFAULT 'exact',
  ADD COLUMN IF NOT EXISTS "pathMatch" "RedirectPathMatch" NOT NULL DEFAULT 'exact';
