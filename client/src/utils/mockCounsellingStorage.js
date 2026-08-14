const STORAGE_KEY = "tgicet_mock_counselling_options";
const ACTIVE_SESSION_KEY = "tgicet_mock_counselling_active_session";

function namespacedKey(base, namespace) { return namespace === "tgicet" ? base : `${base}_${namespace}`; }

export function saveOptions(criteria, preferences, namespace = "tgicet") {
  const payload = { criteria, preferences, savedAt: new Date().toISOString() };
  localStorage.setItem(namespacedKey(STORAGE_KEY, namespace), JSON.stringify(payload));
  return payload;
}

export function loadOptions(namespace = "tgicet") {
  const raw = localStorage.getItem(namespacedKey(STORAGE_KEY, namespace));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveActiveSession(criteria, preferences, step = "candidate", namespace = "tgicet") {
  const payload = { criteria, preferences, step, savedAt: new Date().toISOString() };
  localStorage.setItem(namespacedKey(ACTIVE_SESSION_KEY, namespace), JSON.stringify(payload));
  return payload;
}

export function loadActiveSession(namespace = "tgicet") {
  const raw = localStorage.getItem(namespacedKey(ACTIVE_SESSION_KEY, namespace));
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    return session;
  } catch {
    return null;
  }
}
