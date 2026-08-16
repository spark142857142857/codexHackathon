import { marketEvents } from "@/lib/data";
import { orchestrateEvent } from "@/lib/orchestration";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let eventId = "";
  try {
    const body = await request.json() as { eventId?: string };
    eventId = body.eventId ?? "";
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const event = marketEvents.find((item) => item.id === eventId);
  if (!event) return Response.json({ error: "Signal not found" }, { status: 404 });
  return Response.json(await orchestrateEvent(event));
}
