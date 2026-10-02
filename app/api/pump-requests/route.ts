import { NextRequest, NextResponse } from "next/server";
import { PumpRequest } from "@/lib/dal/types";
import { getBlockMetrics } from "@/lib/dal";
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

  return NextResponse.json(requests, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    if (!body.type || !body.requesterBlockId || !body.reason) {
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
    } catch {
      // Fallback
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

    return NextResponse.json(
      {
        success: true,
        message: "Pump request submitted successfully.",
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, message: "Failed to submit pump request", detail: errorMsg },
      { status: 500 }
    );
  }
}
