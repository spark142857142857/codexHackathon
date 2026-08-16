import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { querySignals } from "@/lib/signal-query";
import type { EvidenceUniverse, SignalCatalog } from "@/lib/types";

const catalog = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "generated", "signal-catalog.json"), "utf8")) as SignalCatalog;
const universe = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "generated", "evidence-universe.json"), "utf8")) as EvidenceUniverse;

describe("full signal catalog", () => {
  it("contains every eligible original from the two complete local corpora", () => {
    expect(catalog.meta.rawCorpusTotal).toBe(145442);
    expect(catalog.records).toHaveLength(32393);
    expect(catalog.meta.entityCounts).toEqual({ musk: 9036, trump: 23357 });
    expect(new Set(catalog.records.map((record) => record.id)).size).toBe(catalog.records.length);
  });

  it("does not claim AI classification before batch results are imported", () => {
    expect(catalog.meta.aiClassified).toBe(0);
    expect(catalog.records.some((record) => record.classificationMethod === "ai")).toBe(false);
    expect(catalog.records.every((record) => record.sourceUrl.startsWith("https://"))).toBe(true);
  });

  it("filters and paginates without sending the whole catalog", () => {
    const result = querySignals(catalog, universe, { entity: "musk", q: "tesla", page: 1, limit: 12 });
    expect(result.items).toHaveLength(12);
    expect(result.pagination.total).toBeGreaterThan(12);
    expect(result.items.every((record) => record.entityId === "musk")).toBe(true);
    expect(result.items.every((record) => `${record.text} ${record.topic} ${record.assets.join(" ")}`.toLowerCase().includes("tesla"))).toBe(true);
  });

  it("offers cluster-representative and evidence-ready scopes", () => {
    const representatives = querySignals(catalog, universe, { scope: "representatives", limit: 100 });
    const evidence = querySignals(catalog, universe, { scope: "evidence", limit: 100 });
    expect(representatives.pagination.total).toBe(catalog.meta.clusterCount);
    expect(evidence.pagination.total).toBe(universe.meta.enrichedCount);
    expect(evidence.items.every((item) => item.evidence?.orchestration.mode === "deterministic")).toBe(true);
  });
});
