/*
  Warnings:

  - Added the required column `expectedResult` to the `RedirectTest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RedirectTest" ADD COLUMN     "expectedResult" JSONB NOT NULL;
