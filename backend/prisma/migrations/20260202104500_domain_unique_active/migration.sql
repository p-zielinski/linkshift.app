-- Drop the global unique constraint so soft-deleted domains can be recreated.
DROP INDEX IF EXISTS "Domain_name_key";

-- Enforce uniqueness only for active domains (deletedAt IS NULL).
CREATE UNIQUE INDEX "Domain_name_active_key"
ON "Domain"("name")
WHERE "deletedAt" IS NULL;
