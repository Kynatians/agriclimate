import { NextRequest, NextResponse } from "next/server";
import { getDistrictSummary, listBlocks, getBlockMetrics, listAlerts, getIrrigationPlan } from "@/lib/dal";
import { logger } from "@/lib/logger";

const log = logger.child("API:report:[districtId]");

export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ districtId: string }> }
) {
  const { districtId } = await params;
  const targetDistrict = districtId || "kurigram";
  const reqTimer = log.time("GET", `Compile comprehensive agroclimatic report for ${targetDistrict}`);

  try {
    const summary = await getDistrictSummary(targetDistrict);
    const blocks = await listBlocks(targetDistrict);
    const activeAlerts = await listAlerts({ districtId: targetDistrict });
    const irrigationPlan = await getIrrigationPlan(targetDistrict);

    const blockMetricsList = await Promise.all(
      blocks.map(async (block) => {
        const metrics = await getBlockMetrics(block.id);
        return {
          block,
          metrics: metrics!,
        };
      })
    );

    const report = {
      districtId: targetDistrict,
      districtName: summary.districtName,
      reportDate: new Date().toISOString(),
      summary,
      blockMetricsList,
      activeAlerts,
      irrigationPlan,
    };

    reqTimer.end({
      targetDistrict,
      blocksCount: blocks.length,
      alertsCount: activeAlerts.length,
      deploymentsCount: irrigationPlan.deployments.length,
    });

    return NextResponse.json(report);
  } catch (error) {
    reqTimer.fail(error, { targetDistrict });
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to generate district report" } },
      { status: 500 }
    );
  }
}
