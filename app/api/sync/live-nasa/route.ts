// app/api/sync/live-nasa/route.ts
// Route handler for on-demand officer telemetry synchronization & scheduled cron jobs

import { NextRequest, NextResponse } from "next/server";
import { syncNasaTelemetry } from "@/lib/dal/live-source";

export async function POST(req: NextRequest) {
  try {
    // Optional cron security token verification
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET_KEY;

    if (cronSecret && authHeader && !authHeader.endsWith(cronSecret)) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid cron authorization token" },
        { status: 401 }
      );
    }

    let force = false;
    try {
      const body = await req.json();
      if (body && typeof body.force === "boolean") {
        force = body.force;
      }
    } catch {
      // Empty or non-JSON body is acceptable for simple POST
    }

    const result = await syncNasaTelemetry(force);

    return NextResponse.json(
      {
        message: "NASA satellite telemetry synchronization completed.",
        data: result,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error during NASA sync";
    console.error("Live NASA sync handler error:", err);
    return NextResponse.json(
      {
        error: "Internal Error during NASA telemetry synchronization",
        detail: errorMsg,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      service: "AgriSentinel Live NASA Synchronization Service",
      status: "operational",
      endpoints: {
        power: "NASA POWER Daily REST (GEOS-FP)",
        firms: "NASA FIRMS VIIRS 375m NRT",
        appeears: "NASA AppEEARS (MODIS / SMAP L4)",
      },
    },
    { status: 200 }
  );
}
