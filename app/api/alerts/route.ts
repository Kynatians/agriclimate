import { NextRequest, NextResponse } from "next/server";
import { listAlerts, Severity, AlertType } from "@/lib/dal";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const districtId = searchParams.get("districtId") || undefined;
    const severity = (searchParams.get("severity") as Severity | "all") || undefined;
    const type = (searchParams.get("type") as AlertType | "all") || undefined;
    const period = (searchParams.get("period") as "24h" | "7d" | "30d") || undefined;

    const alerts = await listAlerts({ districtId, severity, type, period });
    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch alerts" } },
      { status: 500 }
    );
  }
}
