import type { PersistenceState } from "@/lib/types";

export function abnormalReturn(assetReturn: number, benchmarkReturn: number) {
  return assetReturn - benchmarkReturn;
}

export function volumeMultiple(volume: number, trailingVolumes: number[]) {
  if (!trailingVolumes.length) return 0;
  const average = trailingVolumes.reduce((sum, value) => sum + value, 0) / trailingVolumes.length;
  return average === 0 ? 0 : volume / average;
}

export function persistenceState(dayOne: number, dayThree: number): PersistenceState {
  if (dayOne === 0 || dayThree === 0) return "Faded";
  if (Math.sign(dayOne) !== Math.sign(dayThree)) return "Reversed";
  return Math.abs(dayThree) >= Math.abs(dayOne) * 0.5 ? "Persisted" : "Faded";
}

export function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
