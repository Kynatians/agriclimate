import { NextRequest, NextResponse } from "next/server";
import { PumpRequest } from "@/lib/dal/types";
import fs from "fs";
import path from "path";

const LIVE_DIR = path.join(process.cwd(), "data", "live");
const PUMP_REQUESTS_FILE = path.join(LIVE_DIR, "pump-requests.json");

function readPumpRequests(): PumpRequest[] {
  try {
    if (fs.existsSync(PUMP_REQUESTS_FILE)) {
      const raw = fs.readFileSync(PUMP_REQUESTS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // Return empty on error
  }
  return [];
}

function writePumpRequests(requests: PumpRequest[]) {
  try {
    if (!fs.existsSync(LIVE_DIR)) {
      fs.mkdirSync(LIVE_DIR, { recursive: true });
    }
    fs.writeFileSync(PUMP_REQUESTS_FILE, JSON.stringify(requests, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save pump requests to file:", err);
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
    return NextResponse.json({ error: "Pump request not found" }, { status: 404 });
  }

  return NextResponse.json(found, { status: 200 });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));

    if (!body.status || !["approved", "rejected"].includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'rejected'." },
        { status: 400 }
      );
    }

    const requests = readPumpRequests();
    const index = requests.findIndex((r) => r.id === id);

    if (index === -1) {
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

    return NextResponse.json(
      { success: true, request: updatedRequest },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: "Failed to update pump request", detail: errorMsg },
      { status: 500 }
    );
  }
}
