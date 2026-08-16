import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getLivePayload } from "@/lib/live";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  revalidateTag("market-live", "max");
  revalidateTag("gdelt-news", "max");
  revalidateTag("public-news", "max");
  revalidateTag("public-social", "max");
  const payload = await getLivePayload({ force: true });
  return NextResponse.json({
    ok: true,
    refreshedAt: payload.fetchedAt,
    mode: payload.mode,
  });
}
