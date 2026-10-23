// lib/logger.ts
// Structured logging utility designed for Vercel Runtime Logs and local development.
// Supports Node.js and Edge runtimes, automatic error serialization, and performance timings.

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMeta {
  [key: string]: unknown;
}

const IS_VERCEL = Boolean(process.env.VERCEL);
const VERCEL_ENV = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
const VERCEL_REGION = process.env.VERCEL_REGION || "local";
const RUNTIME = process.env.NEXT_RUNTIME || (typeof window === "undefined" ? "nodejs" : "browser");

// Format error into serializable object with stack and causes
export function serializeError(err: unknown): {
  message: string;
  name?: string;
  stack?: string;
  digest?: string;
  cause?: unknown;
} {
  if (err instanceof Error) {
    const serialized: {
      message: string;
      name?: string;
      stack?: string;
      digest?: string;
      cause?: unknown;
    } = {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
    if ("digest" in err && typeof (err as { digest?: unknown }).digest === "string") {
      serialized.digest = (err as { digest: string }).digest;
    }
    if (err.cause) {
      serialized.cause = serializeError(err.cause);
    }
    return serialized;
  }
  return { message: String(err) };
}

class Logger {
  private baseTag?: string;

  constructor(baseTag?: string) {
    this.baseTag = baseTag;
  }

  private formatPrefix(level: LogLevel, tag: string): string {
    const timestamp = new Date().toISOString();
    const envBadge = IS_VERCEL ? `[vercel:${VERCEL_ENV}:${VERCEL_REGION}]` : "[dev]";
    const levelStr = level.toUpperCase().padEnd(5);
    return `${timestamp} ${envBadge} [${levelStr}] [${tag}]`;
  }

  public debug(tagOrMessage: string, messageOrMeta?: string | LogMeta, meta?: LogMeta) {
    if (process.env.NODE_ENV === "production" && !process.env.DEBUG_LOGS) {
      return;
    }
    const { tag, message, data } = this.resolveArgs(tagOrMessage, messageOrMeta, meta);
    const prefix = this.formatPrefix("debug", tag);
    if (data && Object.keys(data).length > 0) {
      console.debug(`${prefix} ${message}`, JSON.stringify(data));
    } else {
      console.debug(`${prefix} ${message}`);
    }
  }

  public info(tagOrMessage: string, messageOrMeta?: string | LogMeta, meta?: LogMeta) {
    const { tag, message, data } = this.resolveArgs(tagOrMessage, messageOrMeta, meta);
    const prefix = this.formatPrefix("info", tag);
    if (data && Object.keys(data).length > 0) {
      console.info(`${prefix} ${message}`, JSON.stringify(data));
    } else {
      console.info(`${prefix} ${message}`);
    }
  }

  public warn(tagOrMessage: string, messageOrMeta?: string | LogMeta, meta?: LogMeta) {
    const { tag, message, data } = this.resolveArgs(tagOrMessage, messageOrMeta, meta);
    const prefix = this.formatPrefix("warn", tag);
    if (data && Object.keys(data).length > 0) {
      console.warn(`${prefix} ${message}`, JSON.stringify(data));
    } else {
      console.warn(`${prefix} ${message}`);
    }
  }

  public error(
    tagOrMessage: string,
    messageOrErr?: string | unknown,
    errOrMeta?: unknown,
    meta?: LogMeta
  ) {
    let tag = this.baseTag || "APP";
    let message = "";
    let errorObj: unknown = null;
    let extraData: LogMeta | undefined = undefined;

    if (typeof tagOrMessage === "string" && typeof messageOrErr === "string") {
      tag = this.baseTag ? `${this.baseTag}:${tagOrMessage}` : tagOrMessage;
      message = messageOrErr;
      errorObj = errOrMeta;
      extraData = meta;
    } else if (typeof tagOrMessage === "string" && messageOrErr !== undefined) {
      // (tag, error) or (message, meta)
      if (this.baseTag) {
        tag = `${this.baseTag}:${tagOrMessage}`;
        errorObj = messageOrErr;
        extraData = errOrMeta as LogMeta;
      } else {
        message = tagOrMessage;
        errorObj = messageOrErr;
        extraData = errOrMeta as LogMeta;
      }
    } else {
      message = tagOrMessage;
    }

    const prefix = this.formatPrefix("error", tag);
    const serialized = errorObj ? serializeError(errorObj) : undefined;
    const combinedData = {
      ...(extraData || {}),
      ...(serialized ? { error: serialized } : {}),
      runtime: RUNTIME,
    };

    if (serialized?.stack) {
      console.error(`${prefix} ${message} -> ${serialized.name || "Error"}: ${serialized.message}\n${serialized.stack}`, JSON.stringify(combinedData));
    } else if (Object.keys(combinedData).length > 0) {
      console.error(`${prefix} ${message}`, JSON.stringify(combinedData));
    } else {
      console.error(`${prefix} ${message}`);
    }
  }

  /**
   * Helper to measure execution duration and log it when finished
   */
  public time(actionTag: string, actionLabel: string, initialMeta?: LogMeta) {
    const start = Date.now();
    this.info(actionTag, `Started: ${actionLabel}`, initialMeta);

    return {
      end: (extraMeta?: LogMeta, customMessage?: string) => {
        const durationMs = Date.now() - start;
        const msg = customMessage || `Completed: ${actionLabel} in ${durationMs}ms`;
        this.info(actionTag, msg, { ...initialMeta, ...extraMeta, durationMs });
        return durationMs;
      },
      fail: (err: unknown, extraMeta?: LogMeta) => {
        const durationMs = Date.now() - start;
        this.error(actionTag, `Failed: ${actionLabel} after ${durationMs}ms`, err, {
          ...initialMeta,
          ...extraMeta,
          durationMs,
        });
        return durationMs;
      },
    };
  }

  /**
   * Create a child logger with a dedicated sub-tag
   */
  public child(subTag: string): Logger {
    const newTag = this.baseTag ? `${this.baseTag}:${subTag}` : subTag;
    return new Logger(newTag);
  }

  private resolveArgs(
    tagOrMessage: string,
    messageOrMeta?: string | LogMeta,
    meta?: LogMeta
  ): { tag: string; message: string; data?: LogMeta } {
    if (typeof messageOrMeta === "string") {
      const tag = this.baseTag ? `${this.baseTag}:${tagOrMessage}` : tagOrMessage;
      return { tag, message: messageOrMeta, data: meta };
    }
    const tag = this.baseTag || "APP";
    const message = tagOrMessage;
    const data = typeof messageOrMeta === "object" ? messageOrMeta : meta;
    return { tag, message, data };
  }
}

export const logger = new Logger();
