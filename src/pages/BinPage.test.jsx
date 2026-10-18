/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BinPage from "./BinPage.jsx";
import { getAllBins, saveAllBins } from "../api/binStorage";
import { downloadSingleQRAsPDF, downloadSingleQRAsPNG } from "../utils/qrGenerator";

vi.mock("../api/binStorage", () => ({
  getAllBins: vi.fn(),
  saveAllBins: vi.fn(),
}));

vi.mock("../utils/qrGenerator", () => ({
  downloadSingleQRAsPDF: vi.fn(),
  downloadSingleQRAsPNG: vi.fn(),
}));

const initialBins = {
  "garage-001": {
    name: "Camping Gear",
    room: "Garage",
    items: ["Tent", "Lantern"],
  },
  "garage-002": {
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

function renderBinPage(binId = "garage-001") {
  return render(
    <MemoryRouter initialEntries={[`/worman-drive/bin/${binId}`]}>
      <Routes>
        <Route path="/:householdId/bin/:binId" element={<BinPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function findItemRow(label) {
  return screen.getByText(label).closest("li");
}

beforeEach(() => {
  vi.clearAllMocks();
  getAllBins.mockResolvedValue(structuredClone(initialBins));
  saveAllBins.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.location.hash = "";
});

describe("BinPage", () => {
  it("loads bin details and items", async () => {
    renderBinPage();

    expect(await screen.findByRole("heading", { name: "Camping Gear" })).toBeInTheDocument();
    expect(screen.getByText("Garage", { selector: ".room-pill" })).toBeInTheDocument();
    expect(screen.getByText("Tent")).toBeInTheDocument();
    expect(screen.getByText("Lantern")).toBeInTheDocument();
  });

  it("shows a not-found view for an unknown bin", async () => {
    renderBinPage("unknown-999");

    expect(await screen.findByText("Bin not found.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Home/ })).toBeInTheDocument();
  });

  it("adds a trimmed item and ignores blank items", async () => {
    const user = userEvent.setup();
    renderBinPage();
    await screen.findByText("Tent");

    const input = screen.getByPlaceholderText("Add new item...");
    await user.type(input, "  Flashlight  ");
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(saveAllBins).toHaveBeenCalledOnce());
    expect(saveAllBins).toHaveBeenCalledWith({
      ...initialBins,
      "garage-001": {
        ...initialBins["garage-001"],
        items: ["Tent", "Lantern", "Flashlight"],
      },
    });

    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(saveAllBins).toHaveBeenCalledOnce();
  });

  it("edits and removes an item", async () => {
    const user = userEvent.setup();
    renderBinPage();
    await screen.findByText("Tent");

    const tentRow = findItemRow("Tent");
    await user.click(within(tentRow).getByRole("button", { name: "Edit" }));
    const editInput = within(tentRow).getByDisplayValue("Tent");
    await user.clear(editInput);
    await user.type(editInput, "  Canopy  ");
    await user.click(within(tentRow).getByRole("button", { name: "✓" }));

    await waitFor(() => expect(saveAllBins).toHaveBeenCalledOnce());
    expect(saveAllBins).toHaveBeenLastCalledWith({
      ...initialBins,
      "garage-001": {
        ...initialBins["garage-001"],
        items: ["Canopy", "Lantern"],
      },
    });

    const lanternRow = findItemRow("Lantern");
    await user.click(within(lanternRow).getByRole("button", { name: "Remove" }));

    await waitFor(() => expect(saveAllBins).toHaveBeenCalledTimes(2));
    expect(saveAllBins).toHaveBeenLastCalledWith({
      ...initialBins,
      "garage-001": {
        ...initialBins["garage-001"],
        items: ["Canopy"],
      },
    });
  });

  it("filters items by search term", async () => {
    const user = userEvent.setup();
    renderBinPage();
    await screen.findByText("Tent");

    await user.type(screen.getByPlaceholderText("Search items..."), "lan");

    expect(screen.getByText("Lantern")).toBeInTheDocument();
    expect(screen.queryByText("Tent")).not.toBeInTheDocument();
  });

  it("transfers selected items between bins", async () => {
    const user = userEvent.setup();
    renderBinPage();
    await screen.findByText("Tent");

    await user.click(screen.getAllByRole("checkbox")[0]);
    const targetSelect = screen.getByRole("combobox");
    await user.selectOptions(targetSelect, "garage-002");
    await user.click(screen.getByRole("button", { name: "Transfer" }));

    await waitFor(() => expect(saveAllBins).toHaveBeenCalledOnce());
    expect(saveAllBins).toHaveBeenCalledWith({
      ...initialBins,
      "garage-001": {
        ...initialBins["garage-001"],
        items: ["Lantern"],
      },
      "garage-002": {
        ...initialBins["garage-002"],
        items: ["Hammer", "Tent"],
      },
    });
  });

  it("renames a bin and persists the change", async () => {
    const user = userEvent.setup();
    renderBinPage();
    await screen.findByText("Tent");

    const titleRow = screen.getByRole("heading", { name: "Camping Gear" }).parentElement;
    await user.click(within(titleRow).getByRole("button", { name: "Edit" }));
    const nameInput = screen.getByDisplayValue("Camping Gear");
    await user.clear(nameInput);
    await user.type(nameInput, "Outdoor Gear");
    await user.click(screen.getByRole("button", { name: "✓" }));

    await waitFor(() => expect(saveAllBins).toHaveBeenCalledOnce());
    expect(saveAllBins).toHaveBeenCalledWith({
      ...initialBins,
      "garage-001": {
        ...initialBins["garage-001"],
        name: "Outdoor Gear",
      },
    });
  });

  it("changes a bin's room and generates a new room-based ID", async () => {
    const user = userEvent.setup();
    renderBinPage();
    await screen.findByText("Tent");

    await user.click(screen.getByText("Garage", { selector: ".room-pill" }));
    await user.selectOptions(screen.getByRole("combobox"), "Basement");

    await waitFor(() => expect(saveAllBins).toHaveBeenCalledOnce());
    expect(saveAllBins).toHaveBeenCalledWith({
      "garage-002": initialBins["garage-002"],
      "basement-001": initialBins["basement-001"],
      "basement-002": {
        ...initialBins["garage-001"],
        room: "Basement",
      },
    });
    await waitFor(() => expect(window.location.hash).toContain("basement-002"));
  });

  it("cancels bin deletion or confirms and persists it", async () => {
    const user = userEvent.setup();
    renderBinPage();
    await screen.findByText("Tent");

    const titleRow = screen.getByRole("heading", { name: "Camping Gear" }).parentElement;
    await user.click(within(titleRow).getByRole("button", { name: "Remove" }));
    expect(screen.getByText(/permanently remove/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(saveAllBins).not.toHaveBeenCalled();

    await user.click(within(titleRow).getByRole("button", { name: "Remove" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(saveAllBins).toHaveBeenCalledOnce());
    expect(saveAllBins).toHaveBeenCalledWith({
      "garage-002": initialBins["garage-002"],
      "basement-001": initialBins["basement-001"],
    });
  });

  it("opens QR options and invokes the PNG download with the bin URL", async () => {
    const user = userEvent.setup();
    renderBinPage();
    await screen.findByText("Tent");

    await user.click(screen.getByRole("button", { name: /Download QR Code/ }));
    await user.click(screen.getByRole("button", { name: "Download as PNG" }));

    expect(downloadSingleQRAsPNG).toHaveBeenCalledWith(
      "Camping Gear",
      `${window.location.origin}/home-storage-organizer/#/worman-drive/bin/garage-001`
    );
    expect(downloadSingleQRAsPDF).not.toHaveBeenCalled();
  });
});
