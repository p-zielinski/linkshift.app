/*
  Warnings:

  - You are about to drop the `CustomPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomPlan" DROP CONSTRAINT "CustomPlan_organizationId_fkey";

-- DropTable
DROP TABLE "CustomPlan";
