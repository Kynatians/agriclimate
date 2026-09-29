import { NextRequest, NextResponse } from "next/server";
import { getTimeSeries } from "@/lib/dal";

export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  try {
    const { blockId } = await params;
    if (!blockId) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing blockId parameter" } },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam, 10) : 30;

    const points = await getTimeSeries(blockId, Number.isNaN(days) ? 30 : days);
    return NextResponse.json(points);
  } catch (error) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch timeseries" } },
      { status: 500 }
    );
  }
}
