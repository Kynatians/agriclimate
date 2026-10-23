import { NextRequest, NextResponse } from "next/server";
import { Alert } from "@/lib/dal/types";
import { logger } from "@/lib/logger";
import fs from "fs";
import path from "path";

const log = logger.child("API:alerts:dispatch");

const IS_VERCEL = Boolean(process.env.VERCEL);
const SEED_DIR = path.join(process.cwd(), "data", "live");
const WRITABLE_DIR = IS_VERCEL ? path.join("/tmp", "agriclimate-live") : SEED_DIR;
const FILENAME = "dispatched-alerts.json";

function getFilePath(forWrite: boolean = false): string {
  if (forWrite) {
    if (!fs.existsSync(WRITABLE_DIR)) {
      try {
        fs.mkdirSync(WRITABLE_DIR, { recursive: true });
      } catch (err) {
        log.error("Failed to create writable directory", err, { dir: WRITABLE_DIR });
      }
    }
    return path.join(WRITABLE_DIR, FILENAME);
  }

  const writableFile = path.join(WRITABLE_DIR, FILENAME);
  if (fs.existsSync(writableFile)) return writableFile;

  const seedFile = path.join(SEED_DIR, FILENAME);
  if (fs.existsSync(seedFile)) return seedFile;

  return writableFile;
}

function readDispatchedAlerts(): Alert[] {
  try {
    const filePath = getFilePath(false);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    log.warn("Could not read dispatched alerts from disk", { error: String(err) });
  }
  return [];
}

function writeDispatchedAlerts(alerts: Alert[]) {
  try {
    const filePath = getFilePath(true);
    fs.writeFileSync(filePath, JSON.stringify(alerts, null, 2), "utf-8");
    log.info(`Saved ${alerts.length} dispatched alerts to ${filePath}`);
  } catch (err) {
    log.error("Could not save dispatched alerts to file", err);
  }
}

export async function POST(request: NextRequest) {
  const reqTimer = log.time("POST", "Broadcast officer advisory alert");
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

    reqTimer.end({ alertId: alert.id, blockId: alert.blockId, severity: alert.severity });

    return NextResponse.json(
      {
        success: true,
        message: `Broadcast advisory successfully transmitted to telecom gateway for block ${alert.blockId}.`,
        alert,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    reqTimer.fail(err);
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
  log.info(`GET dispatched alerts -> returning ${alerts.length} alerts`);
  return NextResponse.json(alerts, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      log.warn("DELETE alert called without ID");
      return NextResponse.json({ error: "Missing alert ID parameter" }, { status: 400 });
    }
    const existing = readDispatchedAlerts();
    const updated = existing.filter((a) => a.id !== id);
    writeDispatchedAlerts(updated);
    log.info(`Deleted dispatched alert ${id}`);
    return NextResponse.json({ success: true, removedId: id }, { status: 200 });
  } catch (err: unknown) {
    log.error("Failed to delete dispatched alert", err);
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, detail: errorMsg }, { status: 500 });
  }
}
