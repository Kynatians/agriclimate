import { NextRequest, NextResponse } from "next/server";
import { getIrrigationPlan } from "@/lib/dal";
import { logger } from "@/lib/logger";

const log = logger.child("API:irrigation");

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const reqTimer = log.time("GET", "Generate irrigation plan");
  try {
    const searchParams = request.nextUrl.searchParams;
    const districtId = searchParams.get("districtId") || "kurigram";

    const plan = await getIrrigationPlan(districtId);
    reqTimer.end({ districtId, deploymentsCount: plan.deployments.length, generatedAt: plan.generatedAt });
    return NextResponse.json(plan);
  } catch (error) {
    reqTimer.fail(error, { url: request.url });
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to generate irrigation plan" } },
      { status: 500 }
    );
  }
}
