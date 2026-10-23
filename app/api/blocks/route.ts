import { NextRequest, NextResponse } from "next/server";
import { listBlocks } from "@/lib/dal";
import { logger } from "@/lib/logger";

const log = logger.child("API:blocks");

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const reqTimer = log.time("GET", "Fetch blocks list");
  try {
    const searchParams = request.nextUrl.searchParams;
    const districtId = searchParams.get("districtId") || undefined;

    const blocks = await listBlocks(districtId);
    reqTimer.end({ districtId, blocksCount: blocks.length });
    return NextResponse.json(blocks);
  } catch (error) {
    reqTimer.fail(error, { url: request.url });
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch blocks" } },
      { status: 500 }
    );
  }
}
