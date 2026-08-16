import { describe, expect, it } from "vitest";
import { marketEvents } from "@/lib/data";

describe("reviewed event dataset", () => {
  it("contains eight cases for every supported person", () => {
    for (const person of ["trump", "musk", "altman"]) {
      expect(marketEvents.filter((event) => event.person === person)).toHaveLength(8);
    }
  });

  it("keeps unique IDs and inspectable source URLs", () => {
    expect(new Set(marketEvents.map((event) => event.id)).size).toBe(marketEvents.length);
    for (const event of marketEvents) {
      expect(event.sourceUrl).toMatch(/^https:\/\//);
      expect(event.window).toHaveLength(4);
      expect(event.priceWindow).toHaveLength(11);
      expect(event.attentionWindow).toHaveLength(11);
      expect(event.attentionWindow.map((point) => point.date)).toEqual(event.priceWindow.map((point) => point.date));
      expect(event.priceWindow.find((point) => point.session === 0)?.date).toBe(event.eventSession);
      expect(event.metrics.volumeMultiple).toBeGreaterThan(0);
      expect(event.orchestration.stages).toHaveLength(6);
    }
  });

  it("represents social, news, filing, and hearing sources without estimating missing news volume", () => {
    expect(new Set(marketEvents.map((event) => event.sourceType))).toEqual(new Set(["Social", "News", "Filing", "Hearing"]));
    const newsBacked = marketEvents.filter((event) => event.attentionWindow.some((point) => point.newsCount !== null));
    expect(newsBacked.length).toBeGreaterThanOrEqual(2);
    const unavailable = marketEvents.find((event) => event.id === "news-openai-gpt45-2025-02-27");
    expect(unavailable?.attentionWindow.every((point) => point.newsCount === null)).toBe(true);
  });

  it("labels Sam Altman market links as proxies", () => {
    const altmanEvents = marketEvents.filter((event) => event.person === "altman");
    expect(altmanEvents.every((event) => event.coverage === "Proxy")).toBe(true);
    expect(altmanEvents.every((event) => event.benchmark === "QQQ")).toBe(true);
  });
});
