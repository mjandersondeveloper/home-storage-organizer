/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { toCanvasMock } = vi.hoisted(() => ({ toCanvasMock: vi.fn() }));

vi.mock("qrcode", () => ({
  default: { toCanvas: toCanvasMock },
}));

import { canvasToBlob, generateStyledQrCanvas } from "./qrGenerator.js";

function makeCanvasFixtures() {
  const qrCanvas = {};
  const measureContext = {
    font: "",
    measureText: vi.fn((text) => ({ width: text.length * 100 })),
  };
  const drawingContext = {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
  };
  const measureCanvas = { getContext: vi.fn(() => measureContext) };
  const outputCanvas = { width: 0, height: 0, getContext: vi.fn(() => drawingContext) };

  return { qrCanvas, measureCanvas, outputCanvas, drawingContext };
}

describe("QR generation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    toCanvasMock.mockReset();
  });

  it("generates a high-error-correction QR and wraps long labels", async () => {
    const { qrCanvas, measureCanvas, outputCanvas, drawingContext } = makeCanvasFixtures();
    const canvases = [qrCanvas, measureCanvas, outputCanvas];
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName !== "canvas") throw new Error(`Unexpected element: ${tagName}`);
      return canvases.shift();
    });
    toCanvasMock.mockResolvedValue(undefined);

    const canvas = await generateStyledQrCanvas("very long label", "https://example.test/bin");

    expect(toCanvasMock).toHaveBeenCalledWith(
      qrCanvas,
      "https://example.test/bin",
      expect.objectContaining({
        width: 800,
        margin: 1,
        errorCorrectionLevel: "H",
      })
    );
    expect(canvas).toBe(outputCanvas);
    expect(outputCanvas.width).toBe(848);
    expect(outputCanvas.height).toBe(1273);
    expect(drawingContext.drawImage).toHaveBeenCalledWith(qrCanvas, 24, 24);
    expect(drawingContext.fillText.mock.calls.map(([text]) => text)).toEqual([
      "very",
      "long",
      "label",
    ]);
  });

  it("resolves the PNG blob returned by a canvas", async () => {
    const blob = new Blob(["png data"], { type: "image/png" });
    const canvas = { toBlob: vi.fn((callback) => callback(blob)) };

    await expect(canvasToBlob(canvas)).resolves.toBe(blob);
    expect(canvas.toBlob).toHaveBeenCalledWith(expect.any(Function), "image/png");
  });
});
