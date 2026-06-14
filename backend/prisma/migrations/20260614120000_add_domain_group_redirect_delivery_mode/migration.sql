CREATE TYPE "RedirectDeliveryMode" AS ENUM ('INSTANT', 'WITH_NOTICE');

ALTER TABLE "DomainGroup"
  ADD COLUMN "redirectDeliveryMode" "RedirectDeliveryMode" NOT NULL DEFAULT 'INSTANT';
