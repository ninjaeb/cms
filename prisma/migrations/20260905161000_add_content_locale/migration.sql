-- Add multi-language support: a translation of a page/post shares its slug
-- with the other locales' rows, so slug alone is no longer globally unique.

-- AlterTable
ALTER TABLE "Content" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';

-- DropIndex
DROP INDEX "Content_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Content_slug_locale_key" ON "Content"("slug", "locale");

-- CreateIndex
CREATE INDEX "Content_locale_idx" ON "Content"("locale");
