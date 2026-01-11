const BIN_ID = "6963224d43b1c97be927fbb8";
const API_KEY = "$2a$10$d8TPiCQ7ZVmSGw5RN2SZIeS9wTCTNotoiCINY2yG1LS7gf7rwUvPO";

const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export async function getAllBins() {
  const res = await fetch(BASE_URL, {
    headers: {
      "X-Master-Key": API_KEY
    }
  });

  const data = await res.json();
  return data.record.bins;
}

export async function saveAllBins(bins) {
  await fetch(BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    body: JSON.stringify({ bins })
  });
}
