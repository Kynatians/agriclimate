import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const log = logger.child("API:voice:query");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    log.info("Voice query received (stub/placeholder)", {
      hasPayload: Boolean(body && Object.keys(body).length > 0),
    });
    return NextResponse.json(
      {
        placeholder: true,
        status: 501,
        message: "Speech-to-text recognition, NLP intent parsing, and local voice synthesis are planned for production (tech spec §0, §7, §12).",
        receivedPayload: body,
      },
      { status: 501 }
    );
  } catch (err) {
    log.error("Failed to parse voice query request", err);
    return NextResponse.json(
      {
        placeholder: true,
        status: 501,
        message: "Voice query placeholder",
      },
      { status: 501 }
    );
  }
}
