import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { EvidenceUniverse } from "@/lib/types";

let cached: EvidenceUniverse | null = null;

export function getEvidenceUniverse(): EvidenceUniverse {
  if (cached) return cached;
  const file = path.join(process.cwd(), "data", "generated", "evidence-universe.json");
  cached = JSON.parse(fs.readFileSync(file, "utf8")) as EvidenceUniverse;
  return cached;
}
