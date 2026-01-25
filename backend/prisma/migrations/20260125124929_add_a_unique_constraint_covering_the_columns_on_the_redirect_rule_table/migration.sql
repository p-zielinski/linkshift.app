/*
  Warnings:

  - A unique constraint covering the columns `[priority,createdAt,id]` on the table `RedirectRule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "RedirectRule_domainGroupId_deletedAt_priority_createdAt_id_idx" ON "RedirectRule"("domainGroupId", "deletedAt", "priority", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "RedirectRule_priority_createdAt_id_key" ON "RedirectRule"("priority", "createdAt", "id");
