import { useMemo, useState } from "react";
import collegeTypes from "../../data/collegeTypes.json";
import { COLLEGE_TYPE_COLORS } from "../../utils/collegeTypeColors";
import CollegeInfoModal from "./CollegeInfoModal";

const COURSE_GROUPS = {
  MBA: ["MBA", "MBT", "MTM"],
  MBT: ["MBA", "MBT", "MTM"],
  MTM: ["MBA", "MBT", "MTM"],
  MCA: ["MCA"],
};

function getCollegeType(code) {
  return collegeTypes[code]?.type ?? "unknown";
}

export default function PreferenceList({ colleges, course, preferences, setPreferences }) {
  const columns = COURSE_GROUPS[course] ?? [course];
  const [selectedCollege, setSelectedCollege] = useState(null);

  const usedCounts = useMemo(() => {
    const counts = {};
    Object.values(preferences).forEach((v) => {
      if (v !== "" && v !== undefined) {
        counts[v] = (counts[v] || 0) + 1;
      }
    });
    return counts;
  }, [preferences]);

  const duplicateNumbers = Object.keys(usedCounts).filter((k) => usedCounts[k] > 1);

  function handlePreferenceChange(code, value) {
    setPreferences((prev) => ({
      ...prev,
      [code]: value === "" ? "" : Number(value),
    }));
  }

  if (colleges.length === 0) {
    return (
      <div className="rounded-md border border-slate-300 bg-white p-8 text-center text-slate-500">
        No colleges found for this course in the selected district(s). Try a different district or course.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-400 text-base" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="border-b border-slate-400 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-6 text-base">
          <span className="font-bold text-blue-800">Color Codes for Colleges :</span>
          {Object.entries(COLLEGE_TYPE_COLORS)
            .filter(([key]) => key !== "unknown")
            .map(([key, { bg, label }]) => (
              <span key={key} className="flex items-center gap-1.5 font-bold text-blue-800">
                {label}
                <span
                  className="inline-block h-4 w-8 border border-slate-500"
                  style={{ backgroundColor: bg }}
                />
              </span>
            ))}
        </div>
        <div className="mt-1 text-base font-bold text-blue-800">{course} Courses</div>
      </div>

      {duplicateNumbers.length > 0 && (
        <div className="border-b border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
          Duplicate preference number{duplicateNumbers.length > 1 ? "s" : ""}: {duplicateNumbers.join(", ")}. Each college must have a unique number.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-base">
          <thead>
            <tr className="bg-[#1f2a3c] text-[#d7e26a]">
              <th className="border border-slate-500/40 px-4 py-3 text-base font-bold">#</th>
              <th className="border border-slate-500/40 px-4 py-3 text-base font-bold">College</th>
              <th className="border border-slate-500/40 px-4 py-3 text-base font-bold">District</th>
              {columns.map((col) => (
                <th key={col} className="border border-slate-500/40 px-4 py-3 text-base font-bold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colleges.map((college, i) => {
              const typeKey = getCollegeType(college.code);
              const { bg } = COLLEGE_TYPE_COLORS[typeKey];
              return (
                <tr key={college.code} style={{ backgroundColor: bg }}>
  <td className="border border-slate-400/40 px-4 py-1.5 text-base font-bold text-slate-900">
    {i + 1}
  </td>
                  <td
  className="cursor-pointer border border-slate-400/40 px-3 py-1.5 hover:bg-black/5"
  onClick={() => setSelectedCollege(college)}
>
  <span className="inline-flex items-center gap-2">
    <span className="rounded border border-slate-500 bg-white px-2 py-0.5 text-sm font-bold text-black">
      {college.code}
    </span>
    <span className="text-sm font-semibold text-slate-800">({college.name})</span>
  </span>
</td>
                  <td className="border border-slate-400/40 px-4 py-1.5 text-base font-bold text-slate-900">
  {college.district}
</td>
                  {columns.map((col) => {
                    if (col !== course) {
  return <td key={col} className="border border-slate-400/40 px-2 py-1.5" />;
}
                    const value = preferences[college.code] ?? "";
                    const isDuplicate = value !== "" && usedCounts[value] > 1;
                    return (
                      <td key={col} className="border border-slate-400/40 px-2 py-1.5">
  <input
    type="number"
    min="1"
    value={value}
    onChange={(e) => handlePreferenceChange(college.code, e.target.value)}
    className={`w-16 rounded border px-2 py-1 text-center text-base outline-none focus:border-brand-500 ${
                            isDuplicate
                              ? "border-2 border-red-500 bg-red-50"
                              : "border-slate-400 bg-white"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CollegeInfoModal college={selectedCollege} onClose={() => setSelectedCollege(null)} />
    </div>
  );
}