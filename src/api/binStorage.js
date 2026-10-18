import { get, ref, set } from "firebase/database";
import { database } from "./firebase";
import { normalizeBins } from "./binData";

const binsRef = ref(database, "bins");

export async function getAllBins() {
  const snapshot = await get(binsRef);
  return normalizeBins(snapshot.exists() ? snapshot.val() : {});
}

export async function saveAllBins(bins) {
  await set(binsRef, normalizeBins(bins));
}
