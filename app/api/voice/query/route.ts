import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(
      {
        placeholder: true,
        status: 501,
        message: "Speech-to-text recognition, NLP intent parsing, and local voice synthesis are planned for production (tech spec §0, §7, §12).",
        receivedPayload: body,
      },
      { status: 501 }
    );
  } catch {
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
