CREATE TYPE "DomainDnsStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

ALTER TABLE "Domain"
  ADD COLUMN "dnsStatus" "DomainDnsStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "dnsVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "dnsLastCheckedAt" TIMESTAMP(3);

UPDATE "Domain"
SET
  "dnsStatus" = 'VERIFIED',
  "dnsVerifiedAt" = NOW()
WHERE "deletedAt" IS NULL;
