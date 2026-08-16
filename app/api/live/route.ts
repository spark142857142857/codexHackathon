import { NextResponse } from "next/server";
import { getLivePayload } from "@/lib/live";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getLivePayload();
  return NextResponse.json(payload, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" },
  });
}

