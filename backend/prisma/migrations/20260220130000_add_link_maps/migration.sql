-- Add LinkMap entities and LinkMapEntry records.

ALTER TABLE "RedirectRule"
  ADD COLUMN IF NOT EXISTS "linkMapId" TEXT;

CREATE TABLE IF NOT EXISTS "LinkMap" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "domainGroupId" TEXT NOT NULL,
  "caseSensitive" BOOLEAN NOT NULL DEFAULT false,
  "queryMatch" "RedirectQueryMatch" NOT NULL DEFAULT 'ignore',
  "fallbackDestination" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "LinkMap_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LinkMapEntry" (
  "id" TEXT NOT NULL,
  "linkMapId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "keyNormalized" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "LinkMapEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LinkMapEntry_linkMapId_keyNormalized_key" ON "LinkMapEntry"("linkMapId", "keyNormalized");
CREATE INDEX IF NOT EXISTS "LinkMap_domainGroupId_idx" ON "LinkMap"("domainGroupId");
CREATE INDEX IF NOT EXISTS "LinkMap_deletedAt_idx" ON "LinkMap"("deletedAt");
CREATE INDEX IF NOT EXISTS "LinkMapEntry_linkMapId_idx" ON "LinkMapEntry"("linkMapId");
CREATE INDEX IF NOT EXISTS "LinkMapEntry_deletedAt_idx" ON "LinkMapEntry"("deletedAt");

ALTER TABLE "LinkMap"
  ADD CONSTRAINT "LinkMap_domainGroupId_fkey"
  FOREIGN KEY ("domainGroupId") REFERENCES "DomainGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LinkMapEntry"
  ADD CONSTRAINT "LinkMapEntry_linkMapId_fkey"
  FOREIGN KEY ("linkMapId") REFERENCES "LinkMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RedirectRule"
  ADD CONSTRAINT "RedirectRule_linkMapId_fkey"
  FOREIGN KEY ("linkMapId") REFERENCES "LinkMap"("id") ON DELETE SET NULL ON UPDATE CASCADE;
