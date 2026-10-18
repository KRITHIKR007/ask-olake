import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendBase = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    const targetUrl = new URL("/health", backendBase);

    const response = await fetch(targetUrl);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: "Internal Server Error",
        detail: error?.message || "Failed to reach backend service via Vercel binding",
      },
      { status: 500 }
    );
  }
}
