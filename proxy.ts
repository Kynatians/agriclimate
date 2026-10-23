// proxy.ts
// Next.js 16 Proxy convention for request correlation and runtime traffic logging in Vercel.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Retrieve or generate unique correlation ID for Vercel tracing
  const vercelId = request.headers.get("x-vercel-id");
  const correlationId = vercelId || `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const country = request.headers.get("x-vercel-ip-country") || "unknown";
  const city = request.headers.get("x-vercel-ip-city") || undefined;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Log incoming request to Vercel Runtime Logs
  logger.info("PROXY", `${request.method} ${pathname}${search}`, {
    reqId: correlationId,
    ip,
    geo: { country, city },
    ua: userAgent.slice(0, 80),
  });

  const response = NextResponse.next();
  response.headers.set("x-request-id", correlationId);
  return response;
}

export const config = {
  matcher: [
    // Apply to all API routes and application pages, skipping static assets & files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|css|js|map)$).*)",
  ],
};
