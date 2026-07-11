export function getDuplicatePreferenceNumbers(preferences) {
  const counts = {};
  Object.values(preferences).forEach((v) => {
    if (v !== "" && v !== undefined) {
      counts[v] = (counts[v] || 0) + 1;
    }
  });
  return Object.keys(counts).filter((k) => counts[k] > 1);
}