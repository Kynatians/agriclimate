import { NextRequest, NextResponse } from "next/server";
import { PumpRequest } from "@/lib/dal/types";
import { logger } from "@/lib/logger";
import fs from "fs";
import path from "path";

const log = logger.child("API:pump-requests:[id]");

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
    log.info(`Updated pump requests persisted to ${filePath}`);
  } catch (err) {
    log.error("Could not save pump requests to file", err);
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const requests = readPumpRequests();
  const found = requests.find((r) => r.id === id);

  if (!found) {
    log.warn(`Pump request ${id} not found`);
    return NextResponse.json({ error: "Pump request not found" }, { status: 404 });
  }

  log.info(`GET pump request ${id} -> status: ${found.status}`);
  return NextResponse.json(found, { status: 200 });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const reqTimer = log.time("PATCH", `Resolve pump request ${id}`);
  try {
    const body = await request.json().catch(() => ({}));

    if (!body.status || !["approved", "rejected"].includes(body.status)) {
      log.warn(`Invalid status update attempt for request ${id}: ${body.status}`);
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'rejected'." },
        { status: 400 }
      );
    }

    const requests = readPumpRequests();
    const index = requests.findIndex((r) => r.id === id);

    if (index === -1) {
      log.warn(`Pump request ${id} not found for status update`);
      return NextResponse.json({ error: "Pump request not found" }, { status: 404 });
    }

    const updatedRequest: PumpRequest = {
      ...requests[index],
      status: body.status,
      resolvedAt: new Date().toISOString(),
      officerNote: body.officerNote ?? requests[index].officerNote,
      resolvedBy: body.resolvedBy || "Upazila Agriculture Office (DAE), Kurigram",
    };

    requests[index] = updatedRequest;
    writePumpRequests(requests);

    reqTimer.end({ id, status: updatedRequest.status, resolvedBy: updatedRequest.resolvedBy });

    return NextResponse.json(
      { success: true, request: updatedRequest },
      { status: 200 }
    );
  } catch (err: unknown) {
    reqTimer.fail(err, { id });
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: "Failed to update pump request", detail: errorMsg },
      { status: 500 }
    );
  }
}
