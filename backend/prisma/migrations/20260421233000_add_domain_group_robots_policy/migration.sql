CREATE TYPE "RobotsPolicy" AS ENUM (
  'NONE',
  'ALLOW_ALL',
  'DISALLOW_ALL',
  'DISALLOW_BAD_BOTS',
  'CUSTOM'
);

ALTER TABLE "DomainGroup"
  ADD COLUMN "robotsPolicy" "RobotsPolicy" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "customRobotsContent" TEXT;

ALTER TABLE "DomainGroup"
  ADD CONSTRAINT "DomainGroup_customRobotsContent_length_check"
  CHECK (
    "customRobotsContent" IS NULL
    OR char_length("customRobotsContent") <= 4096
  );
