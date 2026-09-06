-- AlterTable: ScanRun tracks a base URL to crawl instead of a filesystem root.
ALTER TABLE "ScanRun" RENAME COLUMN "rootDir" TO "baseUrl";

-- AlterTable: PageScan tracks the fetched URL instead of a local file path.
ALTER TABLE "PageScan" RENAME COLUMN "filePath" TO "sourceUrl";

-- AlterTable: Setting tracks the base URL to crawl instead of a local directory.
ALTER TABLE "Setting" RENAME COLUMN "scanRootDir" TO "scanBaseUrl";
