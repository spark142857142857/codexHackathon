import eventsJson from "@/data/generated/events.json";
import atlasEventsJson from "@/data/generated/atlas-events.json";
import liveFallbackJson from "@/data/generated/live-fallback.json";
import type { LivePayload, MarketEvent } from "@/lib/types";

export const reviewedEvents = eventsJson as unknown as MarketEvent[];
export const marketEvents = atlasEventsJson as unknown as MarketEvent[];
export const liveFallback = liveFallbackJson as LivePayload;

export const people = [
  {
    id: "trump" as const,
    name: "Donald Trump",
    shortName: "Trump",
    role: "Policy power",
    description: "Policy, trade, and macro statements mapped to broad-market reactions.",
  },
  {
    id: "musk" as const,
    name: "Elon Musk",
    shortName: "Musk",
    role: "Founder power",
    description: "Company and technology statements with a direct TSLA market link.",
  },
  {
    id: "altman" as const,
    name: "Sam Altman",
    shortName: "Altman",
    role: "Narrative power",
    description: "AI-industry statements measured through explicitly labeled proxy assets.",
  },
];
