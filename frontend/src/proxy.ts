import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intl = createMiddleware(routing);

/**
 * Subdomains that are NEVER treated as tenants — they belong to the
 * platform (marketing, admin, API gateways, etc.) and pass through to
 * next-intl for normal routing.
 */
const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "dash",
  "dashboard",
  "admin",
  "api",
  "cdn",
  "assets",
  "static",
  "files",
  "media",
]);

/**
 * Resolves the subdomain from the request's Host header.
 * Returns null for the bare base domain (localhost, jamiyaweb.com) or any
 * reserved subdomain.
 *
 *   localhost:3000              → null
 *   mosque.localhost:3000       → "mosque"
 *   www.localhost:3000          → null  (reserved)
 *   jamiyaweb.com               → null
 *   mosque.jamiyaweb.com        → "mosque"
 *   www.jamiyaweb.com           → null  (reserved)
 */
function extractTenantSubdomain(host: string | null): string | null {
  if (!host) return null;

  // Strip port
  const hostname = host.split(":")[0].toLowerCase();
  const parts = hostname.split(".");

  let candidate: string | null = null;

  if (parts[parts.length - 1] === "localhost") {
    // foo.localhost → ["foo", "localhost"]
    candidate = parts.length >= 2 ? parts[0] : null;
  } else if (parts.length > 2) {
    // foo.example.com → ["foo", "example", "com"]
    candidate = parts[0];
  }

  if (!candidate) return null;
  if (RESERVED_SUBDOMAINS.has(candidate)) return null;
  if (candidate === "localhost") return null;

  // Subdomain slugs must match the same charset we allow on websites.subdomain
  if (!/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(candidate)) {
    return null;
  }

  return candidate;
}

export function proxy(request: NextRequest): NextResponse | undefined {
  const pathname = request.nextUrl.pathname;

  // Builder iframe target lives at /builder-preview/... on the main host —
  // it must NOT be prefixed with a locale by next-intl middleware. Pass it
  // straight through.
  if (pathname.startsWith("/builder-preview/")) {
    return undefined;
  }

  const subdomain = extractTenantSubdomain(request.headers.get("host"));

  if (subdomain) {
    // Tenant site — rewrite to the catch-all route at /site/{subdomain}/...
    const url = request.nextUrl.clone();
    const originalPath = url.pathname;

    // Don't rewrite already-internal paths (defence in depth — matcher
    // already filters /_next, /api, etc.)
    if (
      originalPath.startsWith("/site/") ||
      originalPath.startsWith("/api/") ||
      originalPath.startsWith("/_next/")
    ) {
      return undefined;
    }

    url.pathname = `/site/${subdomain}${originalPath === "/" ? "" : originalPath}`;
    const response = NextResponse.rewrite(url);
    // Helpful for debugging in DevTools network panel
    response.headers.set("x-jw-tenant", subdomain);
    return response;
  }

  // Not a tenant subdomain — hand off to next-intl for locale routing on
  // the marketing site / dashboard / etc.
  return intl(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
