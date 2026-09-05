import { NextRequest, NextResponse } from "next/server";

/**
 * Optional shared-secret gate for the public content API. When PUBLIC_API_KEY
 * is unset the API is open — no more sensitive than the CMS's own public
 * pages, which serve the same published content without auth. Set it once an
 * external site starts pulling from this API, to keep it off casual scraping.
 */
export function checkPublicApiKey(req: NextRequest): NextResponse | null {
  const required = process.env.PUBLIC_API_KEY;
  if (!required) return null;
  const provided = req.headers.get("x-api-key");
  if (provided !== required) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export const PUBLIC_CONTENT_CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=300";
