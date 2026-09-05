import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const config = {
  matcher: ["/admin/:path*", "/((?!_next|api|.*\\..*).*)"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Public-facing route: check for a manually configured redirect (SEO 301/302 support).
  try {
    const redirect = await prisma.redirect.findUnique({ where: { fromPath: pathname } });
    if (redirect) {
      const url = req.nextUrl.clone();
      if (redirect.toPath.startsWith("http")) {
        return NextResponse.redirect(redirect.toPath, redirect.statusCode);
      }
      url.pathname = redirect.toPath;
      return NextResponse.redirect(url, redirect.statusCode);
    }
  } catch {
    // Ignore lookup failures (e.g. DB unavailable) and let the request pass through.
  }

  return NextResponse.next();
}
