-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT IF EXISTS "Content_authorId_fkey";
ALTER TABLE "Content" DROP CONSTRAINT IF EXISTS "Content_categoryId_fkey";
ALTER TABLE "ContentTag" DROP CONSTRAINT IF EXISTS "ContentTag_contentId_fkey";
ALTER TABLE "ContentTag" DROP CONSTRAINT IF EXISTS "ContentTag_tagId_fkey";
ALTER TABLE "FaqItem" DROP CONSTRAINT IF EXISTS "FaqItem_contentId_fkey";

-- DropTable
DROP TABLE IF EXISTS "ContentTag";
DROP TABLE IF EXISTS "FaqItem";
DROP TABLE IF EXISTS "Content";
DROP TABLE IF EXISTS "Category";
DROP TABLE IF EXISTS "Tag";
DROP TABLE IF EXISTS "Redirect";

-- DropEnum
DROP TYPE IF EXISTS "ContentType";
DROP TYPE IF EXISTS "ContentStatus";

-- AlterTable: Setting loses its blog/branding fields, gains scan config.
ALTER TABLE "Setting"
    DROP COLUMN IF EXISTS "siteName",
    DROP COLUMN IF EXISTS "siteDescription",
    DROP COLUMN IF EXISTS "siteUrl",
    DROP COLUMN IF EXISTS "organizationName",
    DROP COLUMN IF EXISTS "organizationLogo",
    DROP COLUMN IF EXISTS "defaultOgImage",
    DROP COLUMN IF EXISTS "twitterHandle",
    DROP COLUMN IF EXISTS "allowAiCrawlers",
    DROP COLUMN IF EXISTS "llmsTxtIntro",
    ADD COLUMN IF NOT EXISTS "scanRootDir" TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS "enableAiRecommendations" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ScanRun" (
    "id" TEXT NOT NULL,
    "rootDir" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "avgSeoScore" INTEGER,
    "avgGeoScore" INTEGER,

    CONSTRAINT "ScanRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageScan" (
    "id" TEXT NOT NULL,
    "scanRunId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "urlPath" TEXT NOT NULL,
    "title" TEXT,
    "seoScore" INTEGER NOT NULL,
    "geoScore" INTEGER NOT NULL,
    "checklist" JSONB NOT NULL,
    "aiRecommendation" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageScan_scanRunId_idx" ON "PageScan"("scanRunId");

-- AddForeignKey
ALTER TABLE "PageScan" ADD CONSTRAINT "PageScan_scanRunId_fkey" FOREIGN KEY ("scanRunId") REFERENCES "ScanRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
