import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock, refMock, setMock } = vi.hoisted(() => {
  const ref = vi.fn(() => "bins-reference");
  return {
    getMock: vi.fn(),
    refMock: ref,
    setMock: vi.fn(),
  };
});

vi.mock("firebase/database", () => ({
  get: getMock,
  ref: refMock,
  set: setMock,
}));

vi.mock("./firebase", () => ({ database: { testDatabase: true } }));

import { getAllBins, saveAllBins } from "./binStorage.js";

describe("binStorage", () => {
  beforeEach(() => {
    getMock.mockClear();
    setMock.mockClear();
  });

  it("reads bins and normalizes empty item lists", async () => {
    getMock.mockResolvedValue({
      exists: () => true,
      val: () => ({
        "garage-001": { name: "Tools", room: "Garage", items: ["Hammer"] },
        "garage-002": { name: "Empty Box", room: "Garage", items: null },
      }),
    });

    await expect(getAllBins()).resolves.toEqual({
      "garage-001": { name: "Tools", room: "Garage", items: ["Hammer"] },
      "garage-002": { name: "Empty Box", room: "Garage", items: [] },
    });
    expect(refMock).toHaveBeenCalledWith({ testDatabase: true }, "bins");
    expect(getMock).toHaveBeenCalledWith("bins-reference");
  });

  it("returns an empty collection when the database path does not exist", async () => {
    getMock.mockResolvedValue({ exists: () => false });

    await expect(getAllBins()).resolves.toEqual({});
  });

  it("normalizes data before saving to the bins path", async () => {
    setMock.mockResolvedValue(undefined);
    const bins = {
      "garage-001": { name: "Tools", room: "Garage", items: undefined },
    };

    await saveAllBins(bins);

    expect(setMock).toHaveBeenCalledWith("bins-reference", {
      "garage-001": { name: "Tools", room: "Garage", items: [] },
    });
  });
});
