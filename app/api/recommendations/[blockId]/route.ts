import { NextRequest, NextResponse } from "next/server";
import { getBlockMetrics } from "@/lib/dal";
import { recommendTop } from "@/lib/indices/css";
import { logger } from "@/lib/logger";

const log = logger.child("API:recommendations:[blockId]");

export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  const { blockId } = await params;
  const reqTimer = log.time("GET", `Compute crop recommendations for ${blockId}`);
  try {
    if (!blockId) {
      log.warn("Missing blockId parameter");
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing blockId parameter" } },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const nParam = searchParams.get("n");
    const n = nParam ? parseInt(nParam, 10) : 7;

    const metrics = await getBlockMetrics(blockId);
    if (!metrics) {
      log.warn(`Block metrics for ${blockId} not found`);
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Block metrics for ${blockId} not found` } },
        { status: 404 }
      );
    }

    const recommendations = recommendTop(metrics, Number.isNaN(n) ? 7 : n);
    reqTimer.end({ blockId, count: recommendations.length, topCrop: recommendations[0]?.crop.name.en });
    return NextResponse.json(recommendations);
  } catch (error) {
    reqTimer.fail(error, { blockId });
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to compute recommendations" } },
      { status: 500 }
    );
  }
}
