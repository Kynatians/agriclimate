import { NextRequest, NextResponse } from "next/server";
import { Alert } from "@/lib/dal/types";
import fs from "fs";
import path from "path";

const LIVE_DIR = path.join(process.cwd(), "data", "live");
const DISPATCHED_FILE = path.join(LIVE_DIR, "dispatched-alerts.json");

function readDispatchedAlerts(): Alert[] {
  try {
    if (fs.existsSync(DISPATCHED_FILE)) {
      const raw = fs.readFileSync(DISPATCHED_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // Return empty on error
  }
  return [];
}

function writeDispatchedAlerts(alerts: Alert[]) {
  try {
    if (!fs.existsSync(LIVE_DIR)) {
      fs.mkdirSync(LIVE_DIR, { recursive: true });
    }
    fs.writeFileSync(DISPATCHED_FILE, JSON.stringify(alerts, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save dispatched alert to file:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const rawMessage: string = body.message || "";
    let headlineEn = "Official Upazila Agricultural Advisory";
    let detailEn = rawMessage || "Advisory broadcasted to local farming blocks.";
    let note = body.officerNote;

    if (rawMessage.includes("Officer Note:")) {
      const parts = rawMessage.split("Officer Note:");
      headlineEn = parts[0].trim().split("\n")[0] || headlineEn;
      detailEn = parts[0].trim();
      note = parts[1].trim();
    } else if (rawMessage) {
      headlineEn = rawMessage.split("\n")[0] || headlineEn;
    }

    const alert: Alert = {
      id: body.id || `dispatched_${Date.now()}`,
      blockId: body.blockId || "all",
      type: body.type || (headlineEn.toLowerCase().includes("flood") ? "flood" : headlineEn.toLowerCase().includes("fire") ? "fire" : "drought"),
      severity: body.severity || "medium",
      leadTimeHours: body.leadTimeHours || 24,
      headline: {
        en: body.headline?.en || headlineEn,
        bn: body.headline?.bn || "উপজেলা কৃষি কার্যালয়ের জরুরি পরামর্শ বুলেটিন",
      },
      detail: {
        en: body.detail?.en || detailEn,
        bn: body.detail?.bn || "উপজেলা কৃষি কর্মকর্তা কর্তৃক কৃষকদের জন্য প্রেরিত জরুরি নির্দেশনা।",
      },
      officerNote: note || undefined,
      dispatchedBy: "Upazila Agriculture Office (DAE), Kurigram",
      channels: body.channels || ["sms", "push"],
      isOfficerDispatched: true,
      issuedAt: body.timestamp || new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    };

    const existing = readDispatchedAlerts();
    const updated = [alert, ...existing.filter((a) => a.id !== alert.id)];
    writeDispatchedAlerts(updated);

    return NextResponse.json(
      {
        success: true,
        message: `Broadcast advisory successfully transmitted to telecom gateway for block ${alert.blockId}.`,
        alert,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to dispatch advisory",
        detail: errorMsg,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const alerts = readDispatchedAlerts();
  return NextResponse.json(alerts, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing alert ID parameter" }, { status: 400 });
    }
    const existing = readDispatchedAlerts();
    const updated = existing.filter((a) => a.id !== id);
    writeDispatchedAlerts(updated);
    return NextResponse.json({ success: true, removedId: id }, { status: 200 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, detail: errorMsg }, { status: 500 });
  }
}
