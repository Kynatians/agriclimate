import { NextRequest, NextResponse } from "next/server";
import { getBlockMetrics } from "@/lib/dal";

export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing block id parameter" } },
        { status: 400 }
      );
    }

    const metrics = await getBlockMetrics(id);
    if (!metrics) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Metrics for block ${id} not found` } },
        { status: 404 }
      );
    }

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch block metrics" } },
      { status: 500 }
    );
  }
}
