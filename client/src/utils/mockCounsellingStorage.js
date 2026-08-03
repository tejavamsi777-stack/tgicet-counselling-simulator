const STORAGE_KEY = "tgicet_mock_counselling_options";
const ACTIVE_SESSION_KEY = "tgicet_mock_counselling_active_session";

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

export function saveActiveSession(criteria, preferences) {
  const payload = { criteria, preferences, savedAt: new Date().toISOString() };
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(payload));
  return payload;
}

export function loadActiveSession() {
  const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (!session?.criteria?.selectedDistricts || !Array.isArray(session.criteria.selectedDistricts)) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}
