export function sortByPreference(colleges, preferences) {
  return [...colleges].sort((a, b) => {
    const prefA = preferences[a.code];
    const prefB = preferences[b.code];

    const hasA = prefA !== undefined && prefA !== "";
    const hasB = prefB !== undefined && prefB !== "";

    if (hasA && hasB) return prefA - prefB;
    if (hasA && !hasB) return -1;
    if (!hasA && hasB) return 1;
    return 0;
  });
}

export function getFinalOptionList(colleges, preferences) {
  return colleges
    .filter((c) => preferences[c.code] !== undefined && preferences[c.code] !== "")
    .sort((a, b) => preferences[a.code] - preferences[b.code]);
}