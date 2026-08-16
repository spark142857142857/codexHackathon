import { SignalAtlasDashboard } from "@/components/signal-atlas-dashboard";
import { liveFallback, marketEvents } from "@/lib/data";

export default function Home() {
  return <SignalAtlasDashboard events={marketEvents} initialLive={liveFallback} locale="en" />;
}
