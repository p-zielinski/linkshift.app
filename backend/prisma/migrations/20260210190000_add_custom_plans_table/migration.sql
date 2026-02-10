-- CreateTable
CREATE TABLE "CustomPlan" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monthlyVariantId" TEXT,
    "yearlyVariantId" TEXT,
    "limits" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CustomPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomPlan_organizationId_idx" ON "CustomPlan"("organizationId");

-- CreateIndex
CREATE INDEX "CustomPlan_deletedAt_idx" ON "CustomPlan"("deletedAt");

-- CreateIndex
CREATE INDEX "CustomPlan_monthlyVariantId_idx" ON "CustomPlan"("monthlyVariantId");

-- CreateIndex
CREATE INDEX "CustomPlan_yearlyVariantId_idx" ON "CustomPlan"("yearlyVariantId");

-- AddForeignKey
ALTER TABLE "CustomPlan" ADD CONSTRAINT "CustomPlan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
