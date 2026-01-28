-- Create enum for HTTP methods if missing.
DO $$ BEGIN
  CREATE TYPE "HttpMethod" AS ENUM (
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
    'HEAD'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Convert matchMethod from TEXT to HttpMethod[].
ALTER TABLE "RedirectRule"
  ALTER COLUMN "matchMethod" DROP DEFAULT,
  ALTER COLUMN "matchMethod" TYPE "HttpMethod"[] USING (
    CASE
      WHEN "matchMethod" IS NULL OR "matchMethod" = '*' THEN ARRAY[]::"HttpMethod"[]
      ELSE ARRAY[UPPER("matchMethod")]::"HttpMethod"[]
    END
  ),
  ALTER COLUMN "matchMethod" SET DEFAULT ARRAY[]::"HttpMethod"[],
  ALTER COLUMN "matchMethod" SET NOT NULL;
