import { NextRequest, NextResponse } from "next/server";
import { getIrrigationPlan } from "@/lib/dal";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const districtId = searchParams.get("districtId") || "kurigram";

    const plan = await getIrrigationPlan(districtId);
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to generate irrigation plan" } },
      { status: 500 }
    );
  }
}
