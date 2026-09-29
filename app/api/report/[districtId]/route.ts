import { NextRequest, NextResponse } from "next/server";
import { getDistrictSummary, listBlocks, getBlockMetrics, listAlerts, getIrrigationPlan } from "@/lib/dal";

export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ districtId: string }> }
) {
  try {
    const { districtId } = await params;
    const targetDistrict = districtId || "kurigram";

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

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to generate district report" } },
      { status: 500 }
    );
  }
}
