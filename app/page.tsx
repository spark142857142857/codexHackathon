import { MarketDashboard } from "@/components/market-dashboard";
import { liveFallback, marketEvents } from "@/lib/data";

export default function Home() {
  return <MarketDashboard events={marketEvents} initialLive={liveFallback} />;
}

