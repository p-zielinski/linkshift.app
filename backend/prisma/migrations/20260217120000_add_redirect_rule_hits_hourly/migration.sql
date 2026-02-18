-- CreateTable
CREATE TABLE "RedirectRuleHitsHourly" (
    "ruleId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "bucketStart" TIMESTAMP(3) NOT NULL,
    "hits" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RedirectRuleHitsHourly_pkey" PRIMARY KEY ("ruleId","organizationId","bucketStart")
);

-- CreateIndex
CREATE INDEX "RedirectRuleHitsHourly_organizationId_bucketStart_idx" ON "RedirectRuleHitsHourly"("organizationId", "bucketStart");

-- CreateIndex
CREATE INDEX "RedirectRuleHitsHourly_ruleId_bucketStart_idx" ON "RedirectRuleHitsHourly"("ruleId", "bucketStart");

-- AddForeignKey
ALTER TABLE "RedirectRuleHitsHourly" ADD CONSTRAINT "RedirectRuleHitsHourly_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "RedirectRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedirectRuleHitsHourly" ADD CONSTRAINT "RedirectRuleHitsHourly_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
