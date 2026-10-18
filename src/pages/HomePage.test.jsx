/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage.jsx";
import { getAllBins, saveAllBins } from "../api/binStorage";
import {
  downloadAllQRCodesAsPNG,
  downloadAllQRCodesTwoPerPagePDF,
} from "../utils/qrGenerator";

vi.mock("../api/binStorage", () => ({
  getAllBins: vi.fn(),
  saveAllBins: vi.fn(),
}));

vi.mock("../utils/qrGenerator", () => ({
  downloadAllQRCodesAsPNG: vi.fn(),
  downloadAllQRCodesTwoPerPagePDF: vi.fn(),
}));

const initialBins = {
  "garage-001": {
    name: "Camping Gear",
    room: "Garage",
    items: ["Tent", "Lantern"],
  },
  "garage-003": {
    name: "Tools",
    room: "Garage",
    items: ["Hammer"],
  },
  "basement-001": {
    name: "Holiday Box",
    room: "Basement",
    items: [],
  },
};

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getAllBins.mockResolvedValue(structuredClone(initialBins));
  saveAllBins.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("HomePage", () => {
  it("loads bins grouped by room", async () => {
    renderHomePage();

    expect(await screen.findByText("Camping Gear")).toBeInTheDocument();
    expect(screen.getByText("Garage", { selector: "h3" })).toBeInTheDocument();
    expect(screen.getByText("Basement", { selector: "h3" })).toBeInTheDocument();
  });

  it("searches bin names, IDs, and items", async () => {
    const user = userEvent.setup();
    renderHomePage();
    await screen.findByText("Camping Gear");

    const search = screen.getByPlaceholderText("Search bins and items...");
    await user.type(search, "lantern");

    expect(screen.getByText("Camping Gear")).toBeInTheDocument();
    expect(screen.getByText("Lantern")).toBeInTheDocument();
    expect(screen.queryByText("Tools")).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "basement-001");
    expect(screen.getByText("Holiday Box")).toBeInTheDocument();
    expect(screen.queryByText("Camping Gear")).not.toBeInTheDocument();
  });

  it("creates a bin using the next number in the selected room", async () => {
    const user = userEvent.setup();
    renderHomePage();
    await screen.findByText("Camping Gear");

    await user.type(screen.getByPlaceholderText("Bin Name"), "Tent Stakes");
    await user.selectOptions(screen.getByRole("combobox"), "Garage");
    await user.click(screen.getByRole("button", { name: "Create Bin" }));

    await waitFor(() => expect(saveAllBins).toHaveBeenCalledOnce());
    expect(saveAllBins).toHaveBeenCalledWith({
      ...initialBins,
      "garage-004": {
        name: "Tent Stakes",
        room: "Garage",
        items: [],
      },
    });
    expect(screen.getByText("Tent Stakes")).toBeInTheDocument();
  });

  it("requires a bin name and room before creating", async () => {
    const user = userEvent.setup();
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderHomePage();
    await screen.findByText("Camping Gear");

    await user.click(screen.getByRole("button", { name: "Create Bin" }));

    expect(alert).toHaveBeenCalledWith("Please enter both a Bin Name and Room.");
    expect(saveAllBins).not.toHaveBeenCalled();
  });

  it("collapses and expands a room group", async () => {
    const user = userEvent.setup();
    renderHomePage();
    await screen.findByText("Camping Gear");

    await user.click(screen.getByText("Garage", { selector: "h3" }));
    expect(screen.queryByText("Camping Gear")).not.toBeInTheDocument();

    await user.click(screen.getByText("Garage", { selector: "h3" }));
    expect(screen.getByText("Camping Gear")).toBeInTheDocument();
  });

  it("opens QR export options and invokes the selected export", async () => {
    const user = userEvent.setup();
    renderHomePage();
    await screen.findByText("Camping Gear");

    await user.click(screen.getByRole("button", { name: /Download All QR Codes/ }));
    await user.click(screen.getByRole("button", { name: "Download all as PNG (ZIP)" }));

    expect(downloadAllQRCodesAsPNG).toHaveBeenCalledWith(initialBins, "worman-drive");
    expect(downloadAllQRCodesTwoPerPagePDF).not.toHaveBeenCalled();
  });
});
