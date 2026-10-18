export function normalizeBins(bins) {
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