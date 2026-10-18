import { get, ref, set } from "firebase/database";
import { database } from "./firebase";

const binsRef = ref(database, "bins");

function normalizeBins(bins) {
  if (!bins || typeof bins !== "object" || Array.isArray(bins)) return {};

  return Object.fromEntries(
    Object.entries(bins).map(([id, bin]) => [
      id,
      {
        ...bin,
        items: Array.isArray(bin?.items) ? bin.items : [],
      },
    ])
  );
}

export async function getAllBins() {
  const snapshot = await get(binsRef);
  return normalizeBins(snapshot.exists() ? snapshot.val() : {});
}

export async function saveAllBins(bins) {
  await set(binsRef, normalizeBins(bins));
}
