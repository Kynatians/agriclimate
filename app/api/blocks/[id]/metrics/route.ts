import { NextRequest, NextResponse } from "next/server";
import { getBlockMetrics } from "@/lib/dal";
import { logger } from "@/lib/logger";

const log = logger.child("API:blocks:[id]:metrics");

export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reqTimer = log.time("GET", `Fetch metrics for block ${id}`);
  try {
    if (!id) {
      log.warn("Missing block id parameter");
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing block id parameter" } },
        { status: 400 }
      );
    }

    const metrics = await getBlockMetrics(id);
    if (!metrics) {
      log.warn(`Metrics for block ${id} not found`);
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Metrics for block ${id} not found` } },
        { status: 404 }
      );
    }

    reqTimer.end({ id, asOf: metrics.asOf, cwsi: metrics.cwsi });
    return NextResponse.json(metrics);
  } catch (error) {
    reqTimer.fail(error, { id });
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch block metrics" } },
      { status: 500 }
    );
  }
}
