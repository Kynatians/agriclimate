import { NextRequest, NextResponse } from "next/server";
import { listBlocks } from "@/lib/dal";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const districtId = searchParams.get("districtId") || undefined;

    const blocks = await listBlocks(districtId);
    return NextResponse.json(blocks);
  } catch (error) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch blocks" } },
      { status: 500 }
    );
  }
}
