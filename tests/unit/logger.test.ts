import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger, serializeError } from "@/lib/logger";

describe("lib/logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("serializes normal Error objects correctly", () => {
    const error = new Error("Sample test failure");
    const serialized = serializeError(error);

    expect(serialized.name).toBe("Error");
    expect(serialized.message).toBe("Sample test failure");
    expect(serialized.stack).toBeDefined();
  });

  it("serializes Next.js error digests when present", () => {
    const error = new Error("Digest error") as Error & { digest?: string };
    error.digest = "NEXT_123456";
    const serialized = serializeError(error);

    expect(serialized.digest).toBe("NEXT_123456");
  });

  it("logs formatted info messages to console.info", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    logger.info("TEST", "Informational test message", { foo: "bar" });

    expect(spy).toHaveBeenCalled();
    const callArg = spy.mock.calls[0][0];
    expect(callArg).toContain("[INFO ] [TEST] Informational test message");
  });

  it("logs formatted warn messages to console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("TEST", "Warning test message");

    expect(spy).toHaveBeenCalled();
    const callArg = spy.mock.calls[0][0];
    expect(callArg).toContain("[WARN ] [TEST] Warning test message");
  });

  it("logs formatted error messages and stack to console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = new Error("Boom");
    logger.error("TEST", "An operation failed", err);

    expect(spy).toHaveBeenCalled();
    const callArg = spy.mock.calls[0][0];
    expect(callArg).toContain("[ERROR] [TEST] An operation failed -> Error: Boom");
  });

  it("measures latency with time() helper and calls end()", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const timer = logger.time("TIMER", "Action X");
    const duration = timer.end({ resultCount: 5 });

    expect(typeof duration).toBe("number");
    expect(spy).toHaveBeenCalledTimes(2); // Started & Completed
  });

  it("creates scoped child loggers with child()", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const child = logger.child("CHILD_TAG");
    child.info("Child message");

    expect(spy).toHaveBeenCalled();
    const callArg = spy.mock.calls[0][0];
    expect(callArg).toContain("[CHILD_TAG] Child message");
  });
});
