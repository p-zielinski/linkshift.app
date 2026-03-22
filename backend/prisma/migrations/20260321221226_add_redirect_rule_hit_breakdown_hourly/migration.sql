CREATE TABLE "RedirectRuleHitBreakdownHourly" (
    "ruleId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "bucketStart" TIMESTAMP(3) NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "requestMethod" TEXT NOT NULL,
    "requestPath" TEXT NOT NULL,
    "requestQuery" TEXT NOT NULL,
    "requestUrl" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "linkMapKey" TEXT,
    "hits" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RedirectRuleHitBreakdownHourly_pkey" PRIMARY KEY ("ruleId", "organizationId", "bucketStart", "fingerprint")
);

CREATE INDEX "RedirectRuleHitBreakdownHourly_organizationId_bucketStart_idx"
ON "RedirectRuleHitBreakdownHourly"("organizationId", "bucketStart");

CREATE INDEX "RedirectRuleHitBreakdownHourly_ruleId_bucketStart_idx"
ON "RedirectRuleHitBreakdownHourly"("ruleId", "bucketStart");

CREATE INDEX "RedirectRuleHitBreakdownHourly_organizationId_ruleId_bucketStart_idx"
ON "RedirectRuleHitBreakdownHourly"("organizationId", "ruleId", "bucketStart");

ALTER TABLE "RedirectRuleHitBreakdownHourly"
ADD CONSTRAINT "RedirectRuleHitBreakdownHourly_ruleId_fkey"
FOREIGN KEY ("ruleId") REFERENCES "RedirectRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RedirectRuleHitBreakdownHourly"
ADD CONSTRAINT "RedirectRuleHitBreakdownHourly_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
