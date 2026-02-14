-- AlterTable
ALTER TABLE "RedirectRule" ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "RedirectRule_isBlocked_idx" ON "RedirectRule"("isBlocked");
