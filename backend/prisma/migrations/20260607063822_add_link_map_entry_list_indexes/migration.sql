-- PERF-001 GET /api/v1/links list indexes
--
-- Replaces single-column linkMapId/deletedAt indexes with composites that match
-- ORDER BY updatedAt DESC, id DESC (dashboard links table sort).
--
-- (linkMapId, updatedAt DESC, id DESC): per-map and linkMapId-filtered queries;
--   leading linkMapId replaces the old linkMapId-only index.
-- (deletedAt, updatedAt DESC, id DESC): org-wide "All sites" lists after soft-delete
--   filter; join path is DomainGroup -> LinkMap -> LinkMapEntry, then global sort.
--   Standalone linkMapId index is insufficient for org-wide sort without per-map fan-out.

-- DropIndex
DROP INDEX "LinkMapEntry_deletedAt_idx";

-- DropIndex
DROP INDEX "LinkMapEntry_linkMapId_idx";

-- CreateIndex
CREATE INDEX "LinkMapEntry_linkMapId_updatedAt_id_idx" ON "LinkMapEntry"("linkMapId", "updatedAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "LinkMapEntry_deletedAt_updatedAt_id_idx" ON "LinkMapEntry"("deletedAt", "updatedAt" DESC, "id" DESC);
