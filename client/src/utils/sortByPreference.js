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

// Preferences are now keyed by `${collegeCode}_${course}`, since a college
// can have a separate preference number per course it offers. This walks
// each college's offered courses and emits one entry per filled-in number.
export function getFinalOptionList(colleges, preferences) {
  const entries = [];
  colleges.forEach((college) => {
    (college.courses || []).forEach((course) => {
      const key = `${college.code}_${course}`;
      const value = preferences[key];
      if (value !== undefined && value !== "") {
        const courseDetails = (college.courseFees || []).find((item) => item.code === course);
        entries.push({
          ...college,
          course,
          courseName: courseDetails?.name || course,
          preference: value,
        });
      }
    });
  });
  return entries.sort((a, b) => a.preference - b.preference);
}
