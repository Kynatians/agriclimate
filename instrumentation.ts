// instrumentation.ts
// Observability hook for Next.js and Vercel runtime logs.
// Captures uncaught server errors across Server Components, Route Handlers, and Server Actions.

import { type Instrumentation } from "next";
import { logger } from "@/lib/logger";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    logger.info("SERVER:boot", "AgriClimate Node.js server runtime initialized", {
      node: process.version,
      vercelEnv: process.env.VERCEL_ENV || "development",
      region: process.env.VERCEL_REGION || "local",
      gitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
    });
  } else if (process.env.NEXT_RUNTIME === "edge") {
    logger.info("SERVER:boot", "AgriClimate Edge runtime initialized", {
      vercelEnv: process.env.VERCEL_ENV || "development",
      region: process.env.VERCEL_REGION || "local",
      gitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
    });
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  const sanitizedHeaders: Record<string, string | string[]> = {};
  if (request.headers) {
    for (const [key, value] of Object.entries(request.headers)) {
      if (value !== undefined) {
        const lower = key.toLowerCase();
        if (lower.includes("auth") || lower.includes("cookie") || lower.includes("secret") || lower.includes("key")) {
          sanitizedHeaders[key] = "[REDACTED]";
        } else {
          sanitizedHeaders[key] = value;
        }
      }
    }
  }

  logger.error(
    `SERVER:${context.routeType}`,
    `Uncaught runtime error at ${request.method} ${request.path} (${context.routePath})`,
    err,
    {
      request: {
        path: request.path,
        method: request.method,
        headers: sanitizedHeaders,
      },
      context: {
        routerKind: context.routerKind,
        routePath: context.routePath,
        routeType: context.routeType,
      },
    }
  );
};
