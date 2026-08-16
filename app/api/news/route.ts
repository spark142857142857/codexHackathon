import { marketEvents } from "@/lib/data";
import { getNewsEvidence } from "@/lib/gdelt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const eventId = new URL(request.url).searchParams.get("eventId") ?? "";
  const event = marketEvents.find((item) => item.id === eventId);
  if (!event)
    return Response.json({ error: "Signal not found" }, { status: 404 });
  return Response.json(await getNewsEvidence(event), {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
