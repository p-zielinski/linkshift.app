-- AlterTable
ALTER TABLE "User" ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN     "privacyAcceptedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN     "ageConfirmedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN     "legalVersion" TEXT;
