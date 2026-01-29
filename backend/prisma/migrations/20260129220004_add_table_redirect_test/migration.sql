-- CreateTable
CREATE TABLE "RedirectTest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "domainGroupId" TEXT NOT NULL,
    "pathWithQuery" TEXT NOT NULL,
    "requestData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RedirectTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RedirectTest_organizationId_idx" ON "RedirectTest"("organizationId");

-- CreateIndex
CREATE INDEX "RedirectTest_domainGroupId_idx" ON "RedirectTest"("domainGroupId");

-- CreateIndex
CREATE INDEX "RedirectTest_deletedAt_idx" ON "RedirectTest"("deletedAt");

-- CreateIndex
CREATE INDEX "RedirectTest_pathWithQuery_idx" ON "RedirectTest"("pathWithQuery");

-- CreateIndex
CREATE INDEX "RedirectTest_organizationId_deletedAt_createdAt_id_idx" ON "RedirectTest"("organizationId", "deletedAt", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "RedirectTest_createdAt_id_key" ON "RedirectTest"("createdAt", "id");

-- AddForeignKey
ALTER TABLE "RedirectTest" ADD CONSTRAINT "RedirectTest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedirectTest" ADD CONSTRAINT "RedirectTest_domainGroupId_fkey" FOREIGN KEY ("domainGroupId") REFERENCES "DomainGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
