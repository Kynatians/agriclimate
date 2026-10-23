import { NextRequest, NextResponse } from "next/server";
import { getTimeSeries } from "@/lib/dal";
import { logger } from "@/lib/logger";

const log = logger.child("API:timeseries:[blockId]");

export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  const { blockId } = await params;
  const reqTimer = log.time("GET", `Fetch time-series for ${blockId}`);
  try {
    if (!blockId) {
      log.warn("Missing blockId parameter");
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing blockId parameter" } },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam, 10) : 30;

    const points = await getTimeSeries(blockId, Number.isNaN(days) ? 30 : days);
    reqTimer.end({ blockId, days, pointsCount: points.length });
    return NextResponse.json(points);
  } catch (error) {
    reqTimer.fail(error, { blockId });
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch timeseries" } },
      { status: 500 }
    );
  }
}
