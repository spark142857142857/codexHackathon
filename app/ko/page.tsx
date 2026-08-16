import type { Metadata } from "next";
import { SignalAtlasDashboard } from "@/components/signal-atlas-dashboard";
import { liveFallback, marketEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Market Signal Atlas — 공개 정보와 실제 시장 반응",
  description: "공개 발언 전후의 실제 자산 가격과 시장 반응을 탐색하는 시그널 인텔리전스 대시보드",
};

export default function KoreanHome() {
  return <SignalAtlasDashboard events={marketEvents} initialLive={liveFallback} locale="ko" />;
}
