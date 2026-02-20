-- Add subset query match option.
DO $$ BEGIN
  ALTER TYPE "RedirectQueryMatch" ADD VALUE IF NOT EXISTS 'subset';
EXCEPTION
  WHEN undefined_object THEN
    CREATE TYPE "RedirectQueryMatch" AS ENUM ('exact', 'ignore', 'subset');
END $$;
