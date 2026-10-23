import { NextRequest, NextResponse } from "next/server";
import { PumpRequest } from "@/lib/dal/types";
import { getBlockMetrics } from "@/lib/dal";
import { logger } from "@/lib/logger";
import fs from "fs";
import path from "path";

const log = logger.child("API:pump-requests");

const IS_VERCEL = Boolean(process.env.VERCEL);
const SEED_DIR = path.join(process.cwd(), "data", "live");
const WRITABLE_DIR = IS_VERCEL ? path.join("/tmp", "agriclimate-live") : SEED_DIR;
const FILENAME = "pump-requests.json";

function getFilePath(forWrite: boolean = false): string {
  if (forWrite) {
    if (!fs.existsSync(WRITABLE_DIR)) {
      try {
        fs.mkdirSync(WRITABLE_DIR, { recursive: true });
      } catch (err) {
        log.error("Failed to create pump requests directory", err, { dir: WRITABLE_DIR });
      }
    }
    return path.join(WRITABLE_DIR, FILENAME);
  }

  const writableFile = path.join(WRITABLE_DIR, FILENAME);
  if (fs.existsSync(writableFile)) return writableFile;

  const seedFile = path.join(SEED_DIR, FILENAME);
  if (fs.existsSync(seedFile)) return seedFile;

  return writableFile;
}

function readPumpRequests(): PumpRequest[] {
  try {
    const filePath = getFilePath(false);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    log.warn("Could not read pump requests from disk", { error: String(err) });
  }
  return [];
}

function writePumpRequests(requests: PumpRequest[]) {
  try {
    const filePath = getFilePath(true);
    fs.writeFileSync(filePath, JSON.stringify(requests, null, 2), "utf-8");
    log.info(`Saved ${requests.length} pump requests to ${filePath}`);
  } catch (err) {
    log.error("Could not save pump requests to file", err);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const blockId = searchParams.get("blockId");

  let requests = readPumpRequests();

  if (status) {
    requests = requests.filter((r) => r.status === status);
  }
  if (blockId) {
    requests = requests.filter(
      (r) => r.requesterBlockId === blockId || r.targetBlockId === blockId
    );
  }

  log.info(`GET pump requests (status: ${status || "all"}, blockId: ${blockId || "all"}) -> returning ${requests.length} records`);
  return NextResponse.json(requests, { status: 200 });
}

export async function POST(request: NextRequest) {
  const reqTimer = log.time("POST", "Submit community solar pump request");
  try {
    const body = await request.json().catch(() => ({}));

    if (!body.type || !body.requesterBlockId || !body.reason) {
      log.warn("Pump request missing required fields", { body });
      return NextResponse.json(
        { success: false, message: "Missing required fields: type, requesterBlockId, reason" },
        { status: 400 }
      );
    }

    let deficitSeverity: number | undefined = undefined;
    try {
      const metrics = await getBlockMetrics(body.requesterBlockId);
      if (metrics) {
        // CWSI (0 to 1) scaled to 0-100
        deficitSeverity = Math.min(100, Math.max(0, Math.round(metrics.cwsi * 100)));
      }
    } catch (err) {
      log.warn(`Could not compute deficit severity for block ${body.requesterBlockId}`, { error: String(err) });
    }

    const newRequest: PumpRequest = {
      id: body.id || `pr_${Date.now()}`,
      type: body.type,
      status: "pending",
      requesterBlockId: body.requesterBlockId,
      requesterBlockName: body.requesterBlockName || body.requesterBlockId,
      targetBlockId: body.targetBlockId || undefined,
      targetBlockName: body.targetBlockName || undefined,
      reason: body.reason,
      urgency: body.urgency || "medium",
      deficitSeverity,
      requestedAt: new Date().toISOString(),
    };

    const existing = readPumpRequests();
    const updated = [newRequest, ...existing.filter((r) => r.id !== newRequest.id)];
    writePumpRequests(updated);

    reqTimer.end({ id: newRequest.id, requester: newRequest.requesterBlockId, type: newRequest.type });

    return NextResponse.json(
      {
        success: true,
        message: "Pump request submitted successfully.",
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    reqTimer.fail(err);
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, message: "Failed to submit pump request", detail: errorMsg },
      { status: 500 }
    );
  }
}
