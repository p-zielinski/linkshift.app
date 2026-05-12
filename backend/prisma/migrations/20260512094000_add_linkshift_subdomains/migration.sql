-- CreateTable
CREATE TABLE "LinkShiftSubdomain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domainGroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LinkShiftSubdomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkShiftSubdomain_name_idx" ON "LinkShiftSubdomain"("name");

-- CreateIndex
CREATE INDEX "LinkShiftSubdomain_domainGroupId_idx" ON "LinkShiftSubdomain"("domainGroupId");

-- CreateIndex
CREATE INDEX "LinkShiftSubdomain_deletedAt_idx" ON "LinkShiftSubdomain"("deletedAt");

-- AddForeignKey
ALTER TABLE "LinkShiftSubdomain"
ADD CONSTRAINT "LinkShiftSubdomain_domainGroupId_fkey"
FOREIGN KEY ("domainGroupId") REFERENCES "DomainGroup"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
