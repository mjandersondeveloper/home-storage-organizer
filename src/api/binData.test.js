import { describe, expect, it } from "vitest";
import { normalizeBins } from "./binData.js";

describe("normalizeBins", () => {
  it("defaults missing, null, and non-array items to empty arrays", () => {
    const bins = normalizeBins({
      "garage-001": { name: "Missing items", room: "Garage" },
      "garage-002": { name: "Null items", room: "Garage", items: null },
      "garage-003": { name: "Invalid items", room: "Garage", items: "hammer" },
    });

    expect(bins["garage-001"].items).toEqual([]);
    expect(bins["garage-002"].items).toEqual([]);
    expect(bins["garage-003"].items).toEqual([]);
  });

  it("preserves valid bin fields and item arrays", () => {
    const bin = {
      name: "Tools",
      room: "Garage",
      items: ["hammer", "wrench"],
    };

    expect(normalizeBins({ "garage-004": bin })["garage-004"]).toEqual(bin);
  });

  it("returns an empty object for an empty or invalid root value", () => {
    expect(normalizeBins(null)).toEqual({});
    expect(normalizeBins([])).toEqual({});
  });
});