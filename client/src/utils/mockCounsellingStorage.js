const STORAGE_KEY = "tgicet_mock_counselling_options";

export function saveOptions(criteria, preferences) {
  const payload = { criteria, preferences, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function loadOptions() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}