-- CreateEnum
CREATE TYPE "BillingCheckoutStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "BillingCheckoutSession" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" "BillingCheckoutStatus" NOT NULL DEFAULT 'PENDING',
    "providerCheckoutId" TEXT,
    "providerOrderId" TEXT,
    "providerSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "BillingCheckoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BillingCheckoutSession_organizationId_idx" ON "BillingCheckoutSession"("organizationId");

-- CreateIndex
CREATE INDEX "BillingCheckoutSession_userId_idx" ON "BillingCheckoutSession"("userId");

-- CreateIndex
CREATE INDEX "BillingCheckoutSession_status_idx" ON "BillingCheckoutSession"("status");

-- CreateIndex
CREATE INDEX "BillingCheckoutSession_providerCheckoutId_idx" ON "BillingCheckoutSession"("providerCheckoutId");

-- CreateIndex
CREATE INDEX "BillingCheckoutSession_providerSubscriptionId_idx" ON "BillingCheckoutSession"("providerSubscriptionId");

-- AddForeignKey
ALTER TABLE "BillingCheckoutSession" ADD CONSTRAINT "BillingCheckoutSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingCheckoutSession" ADD CONSTRAINT "BillingCheckoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
