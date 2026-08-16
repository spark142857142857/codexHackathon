import { describe, expect, it } from "vitest";
import { abnormalReturn, persistenceState, round, volumeMultiple } from "@/lib/metrics";

describe("reaction metrics", () => {
  it("subtracts the benchmark from the linked asset return", () => {
    expect(abnormalReturn(3.4, 1.1)).toBeCloseTo(2.3);
  });

  it("compares event volume with the trailing average", () => {
    expect(volumeMultiple(200, [80, 100, 120])).toBe(2);
    expect(volumeMultiple(200, [])).toBe(0);
  });

  it("classifies three-day persistence without an opaque score", () => {
    expect(persistenceState(2, 1.4)).toBe("Persisted");
    expect(persistenceState(2, 0.4)).toBe("Faded");
    expect(persistenceState(2, -0.2)).toBe("Reversed");
  });

  it("rounds display values predictably", () => {
    expect(round(1.2345)).toBe(1.23);
  });
});

