/**
 * Strict Prefix & Word-Boundary Matcher
 * Ensures searches match only from word starts or exact code prefixes.
 *
 * Examples:
 * - Query "cbit" matches code "CBIT", or "Chaitanya... [CBIT]"
 * - Query "cbit" does NOT match substrings embedded inside words.
 * - Query "cse" matches "CSE", "CSE (AI&ML)", but not words with "cse" buried inside.
 */

export function strictWordMatch(target, query) {
  if (!query || !String(query).trim()) return true;
  if (!target) return false;

  const q = String(query).trim().toLowerCase();
  const text = String(target).toLowerCase();

  // 1. Direct prefix
  if (text.startsWith(q)) return true;

  // 2. Word-boundary prefix
  const words = text.split(/[\s,()\[\]\-_./\\+]+/);
  return words.some((word) => word.startsWith(q));
}

export function strictMultiFieldMatch(fields, query) {
  if (!query || !String(query).trim()) return true;
  const q = String(query).trim().toLowerCase();

  if (!Array.isArray(fields)) {
    return strictWordMatch(fields, q);
  }

  return fields.some((field) => strictWordMatch(field, q));
}

export default strictWordMatch;
