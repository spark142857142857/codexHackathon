import type { CandidateClassificationMethod, SignalCatalog, SignalCatalogResponse } from "@/lib/types";

export interface SignalQuery {
  page?: number;
  limit?: number;
  q?: string;
  entity?: string;
  method?: CandidateClassificationMethod | "all";
  topic?: string;
}

export function querySignals(catalog: SignalCatalog, query: SignalQuery): SignalCatalogResponse {
  const page = Math.max(1, Math.floor(query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Math.floor(query.limit ?? 20)));
  const needle = (query.q ?? "").trim().toLowerCase();
  const entity = query.entity ?? "all";
  const method = query.method ?? "all";
  const topic = query.topic ?? "all";

  const filtered = catalog.records.filter((record) => {
    if (entity !== "all" && record.entityId !== entity) return false;
    if (method !== "all" && record.classificationMethod !== method) return false;
    if (topic !== "all" && record.topic !== topic) return false;
    if (!needle) return true;
    return `${record.text} ${record.entity} ${record.topic} ${record.assets.join(" ")} ${record.hashtags.join(" ")}`.toLowerCase().includes(needle);
  });

  const topicCounts = new Map<string, number>();
  for (const record of catalog.records) topicCounts.set(record.topic, (topicCounts.get(record.topic) ?? 0) + 1);
  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * limit;

  return {
    meta: catalog.meta,
    items: filtered.slice(start, start + limit),
    pagination: { page: safePage, limit, total: filtered.length, pages },
    facets: {
      topics: [...topicCounts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)),
    },
  };
}
