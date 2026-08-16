import { describe, expect, it } from "vitest";
import { marketEvents, reviewedEvents } from "@/lib/data";

describe("atlas event datasets", () => {
  it("uses every evidence-ready signal in the main atlas", () => {
    expect(marketEvents.length).toBeGreaterThan(300);
    expect(new Set(marketEvents.map((event) => event.person))).toEqual(
      new Set(["trump", "musk", "nvidia", "openai", "tesla", "us-senate"]),
    );
    expect(marketEvents.every((event) => event.orchestration.stages.length === 6)).toBe(true);
  });

  it("retains the expanded reviewed records as a separate reference dataset", () => {
    expect(reviewedEvents).toHaveLength(33);
    for (const person of ["trump", "musk", "altman"]) {
      expect(reviewedEvents.filter((event) => event.person === person)).toHaveLength(8);
    }
  });

  it("includes reviewed cross-source signals in the uncapped atlas", () => {
    expect(marketEvents.filter((event) => event.sourceType === "News")).toHaveLength(7);
    expect(marketEvents.filter((event) => event.sourceType === "Filing")).toHaveLength(1);
    expect(marketEvents.filter((event) => event.sourceType === "Hearing")).toHaveLength(1);
    expect(marketEvents.filter((event) => event.sourceType === "Social")).toHaveLength(
      marketEvents.length - 9,
    );
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
      expect(event.relatedAssets).toEqual(
        expect.arrayContaining(["SPY", "QQQ", "BTC-USD"]),
      );
      for (const symbol of ["SPY", "QQQ", "BTC-USD"]) {
        expect(event.priceWindows[symbol]).toHaveLength(11);
      }
    }
  });

  it("represents social, news, filing, and hearing sources without estimating missing news volume", () => {
    expect(new Set(reviewedEvents.map((event) => event.sourceType))).toEqual(new Set(["Social", "News", "Filing", "Hearing"]));
    const newsBacked = reviewedEvents.filter((event) => event.attentionWindow.some((point) => point.newsCount !== null));
    expect(newsBacked.length).toBeGreaterThanOrEqual(2);
    const unavailable = reviewedEvents.find((event) => event.id === "news-openai-gpt45-2025-02-27");
    expect(unavailable?.attentionWindow.every((point) => point.newsCount === null)).toBe(true);
  });

  it("labels Sam Altman market links as proxies", () => {
    const altmanEvents = reviewedEvents.filter((event) => event.person === "altman");
    expect(altmanEvents.every((event) => event.coverage === "Proxy")).toBe(true);
    expect(altmanEvents.every((event) => event.benchmark === "QQQ")).toBe(true);
  });
});
