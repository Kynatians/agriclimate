import { NextRequest, NextResponse } from "next/server";
import { listAlerts, Severity, AlertType } from "@/lib/dal";
import { logger } from "@/lib/logger";

const log = logger.child("API:alerts");

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const reqTimer = log.time("GET", "Fetch active climate alerts");
  try {
    const searchParams = request.nextUrl.searchParams;
    const districtId = searchParams.get("districtId") || undefined;
    const severity = (searchParams.get("severity") as Severity | "all") || undefined;
    const type = (searchParams.get("type") as AlertType | "all") || undefined;
    const period = (searchParams.get("period") as "24h" | "7d" | "30d") || undefined;

    const alerts = await listAlerts({ districtId, severity, type, period });
    reqTimer.end({ districtId, severity, type, period, alertsCount: alerts.length });
    return NextResponse.json(alerts);
  } catch (error) {
    reqTimer.fail(error, { url: request.url });
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch alerts" } },
      { status: 500 }
    );
  }
}
