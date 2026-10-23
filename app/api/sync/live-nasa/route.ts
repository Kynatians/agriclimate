// app/api/sync/live-nasa/route.ts
// Route handler for on-demand officer telemetry synchronization & scheduled cron jobs

import { NextRequest, NextResponse } from "next/server";
import { syncNasaTelemetry } from "@/lib/dal/live-source";
import { logger } from "@/lib/logger";

const log = logger.child("API:sync:live-nasa");

export async function POST(req: NextRequest) {
  const reqTimer = log.time("POST", "Trigger live NASA telemetry sync");
  try {
    // Optional cron security token verification
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET_KEY;

    if (cronSecret && authHeader && !authHeader.endsWith(cronSecret)) {
      log.warn("Unauthorized sync attempt: invalid cron secret token");
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

    log.info(`Executing NASA sync (force: ${force})`);
    const result = await syncNasaTelemetry(force);

    reqTimer.end({
      success: result.success,
      blocksUpdated: result.blocksUpdated,
      alertsGenerated: result.alertsGenerated,
      errorsCount: result.errors?.length || 0,
    });

    return NextResponse.json(
      {
        message: "NASA satellite telemetry synchronization completed.",
        data: result,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    reqTimer.fail(err);
    const errorMsg = err instanceof Error ? err.message : "Unknown error during NASA sync";
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
  log.info("GET /api/sync/live-nasa health probe");
  return NextResponse.json(
    {
      service: "AgriClimate Live NASA Synchronization Service",
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
