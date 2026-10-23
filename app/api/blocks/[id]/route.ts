import { NextRequest, NextResponse } from "next/server";
import { getBlock } from "@/lib/dal";
import { logger } from "@/lib/logger";

const log = logger.child("API:blocks:[id]");

export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reqTimer = log.time("GET", `Fetch block ${id}`);
  try {
    if (!id) {
      log.warn("Missing block id parameter");
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing block id parameter" } },
        { status: 400 }
      );
    }

    const block = await getBlock(id);
    if (!block) {
      log.info(`Block with id ${id} not found`);
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Block with id ${id} not found` } },
        { status: 404 }
      );
    }

    reqTimer.end({ id, blockName: block.name });
    return NextResponse.json(block);
  } catch (error) {
    reqTimer.fail(error, { id });
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch block" } },
      { status: 500 }
    );
  }
}
