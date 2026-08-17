/**
 * Automatically determines status ('active' | 'upcoming' | 'concluded')
 * based on date ranges (e.g. "August 18 – August 19, 2026", "August 17, 2026", "July 31 – August 05, 2026")
 */
export function getAutoStatus(dateStr, defaultYear = 2026) {
  if (!dateStr) return 'upcoming';

  const now = new Date();
  const clean = dateStr
    .replace(/[–—]/g, '-')
    .replace(/On or before /i, '')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = clean.split('-').map(s => s.trim());
  const yearMatch = clean.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : defaultYear;

  let startPart = parts[0];
  let endPart = parts.length === 2 ? parts[1] : parts[0];

  // If startPart lacks year, handle month extraction
  if (!startPart.match(/\b20\d{2}\b/)) {
    if (!/[a-zA-Z]+/.test(startPart)) {
      const m = endPart.match(/([a-zA-Z]+)/);
      if (m) startPart = `${m[1]} ${startPart} ${year}`;
    } else {
      startPart = `${startPart} ${year}`;
    }
  }

  // If endPart lacks year
  if (!endPart.match(/\b20\d{2}\b/)) {
    endPart = `${endPart} ${year}`;
  }

  const startDate = new Date(startPart);
  const endDate = new Date(endPart);

  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (now > endDate) {
      return 'concluded';
    } else if (now >= startDate && now <= endDate) {
      return 'active';
    } else {
      return 'upcoming';
    }
  }

  return 'upcoming';
}

/**
 * Derives overall phase status from its step dates
 */
export function getPhaseAutoStatus(phase) {
  if (!phase || !phase.steps || phase.steps.length === 0) {
    return phase?.status || 'upcoming';
  }

  const statuses = phase.steps.map(s => getAutoStatus(s.dates));

  if (statuses.includes('active')) {
    return 'active';
  }

  const allConcluded = statuses.every(s => s === 'concluded');
  if (allConcluded) {
    return 'concluded';
  }

  return 'upcoming';
}

/**
 * Returns formatted { status, badge } for UI badges from date strings
 */
export function computeStatusFromDates(dateStr, defaultYear = 2026) {
  const status = getAutoStatus(dateStr, defaultYear);
  if (status === 'active') {
    return { status: 'Live Now', badge: 'Active' };
  } else if (status === 'concluded') {
    return { status: 'Concluded', badge: 'Completed' };
  }
  return { status: 'Upcoming', badge: 'Upcoming' };
}
