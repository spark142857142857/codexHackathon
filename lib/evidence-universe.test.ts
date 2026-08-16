import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { EvidenceUniverse, SignalCatalog } from "@/lib/types";

const catalog = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "generated", "signal-catalog.json"), "utf8")) as SignalCatalog;
const universe = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "generated", "evidence-universe.json"), "utf8")) as EvidenceUniverse;

describe("deterministic evidence universe", () => {
  it("uses exactly one representative per cluster", () => {
    expect(universe.representativeIds).toHaveLength(catalog.meta.clusterCount);
    expect(new Set(universe.representativeIds).size).toBe(catalog.meta.clusterCount);
  });

  it("enriches every eligible market-relevant cluster without a product cap", () => {
    expect(universe.evidence.length).toBeGreaterThan(300);
    expect(universe.meta.assetCoverage).toContain("BTC-USD");
    expect(universe.meta.assetCoverage).toContain("SOXX");
    const enrichedAssets = new Set(universe.evidence.map((item) => item.asset));
    expect(enrichedAssets.has("BTC-USD")).toBe(true);
    expect(enrichedAssets.has("SOXX")).toBe(true);
  });

  it("attaches calculated prices, scoped attention and six audited stages", () => {
    for (const item of universe.evidence) {
      expect(item.priceWindow).toHaveLength(11);
      expect(item.attentionCoverage).toContain("tracked Trump and Musk");
      expect(item.linkedMediaReferences).toBeGreaterThanOrEqual(0);
      expect(item.orchestration.mode).toBe("deterministic");
      expect(item.orchestration.stages.map((stage) => stage.id)).toEqual(["classify", "map", "amplify", "market", "audit", "report"]);
    }
    expect(universe.evidence.some((item) => item.linkedMediaReferences > 0)).toBe(true);
  });
});
