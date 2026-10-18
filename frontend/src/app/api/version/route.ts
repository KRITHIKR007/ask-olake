import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "1.0.0",
    service: "Ask OLake",
    description: "AI Documentation & Architecture Assistant for OLake",
    status: "ok",
    index_loaded: true,
    indexed_chunks: 4586,
  });
}
