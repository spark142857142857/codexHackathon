import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { SignalCatalog } from "@/lib/types";

let cached: SignalCatalog | null = null;

export function getSignalCatalog(): SignalCatalog {
  if (cached) return cached;
  const file = path.join(process.cwd(), "data", "generated", "signal-catalog.json");
  cached = JSON.parse(fs.readFileSync(file, "utf8")) as SignalCatalog;
  return cached;
}
