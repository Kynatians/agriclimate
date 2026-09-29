import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(
      {
        placeholder: true,
        status: 501,
        message: "SMS and IVR dispatch gateway is a planned production feature (tech spec §0, §7, §12). In this prototype, dispatch actions are recorded locally.",
        receivedPayload: body,
      },
      { status: 501 }
    );
  } catch {
    return NextResponse.json(
      {
        placeholder: true,
        status: 501,
        message: "SMS/IVR dispatch placeholder",
      },
      { status: 501 }
    );
  }
}
