import { useMemo, useState } from "react";
import collegeTypes from "../../data/collegeTypes.json";
import { COLLEGE_TYPE_COLORS } from "../../utils/collegeTypeColors";
import CollegeInfoModal from "./CollegeInfoModal";

const MBA_COURSES = ["MBA", "MBT", "MTM"];
const MCA_COURSES = ["MCA"];

function getCollegeType(code) {
  return collegeTypes[code]?.type ?? "unknown";
}

function CourseTable({ title, courses, colleges, preferences, usedCounts, onPreferenceChange, onSelectCollege }) {
  const courseColleges = colleges.filter((college) =>
    courses.some((course) => college.courses?.includes(course))
  );

  return (
    <section>
      <p className="px-1 pb-0.5 text-[12px] text-[#0000b0]">{title}</p>
    <div
        className="max-h-[510px] overflow-y-auto overscroll-contain border border-[#52647b]"
        style={{ touchAction: "pan-y" }}
        onWheel={(e) => {
          const el = e.currentTarget;
          const atTop = el.scrollTop === 0 && e.deltaY < 0;
          const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight && e.deltaY > 0;
          if (!atTop && !atBottom) {
            e.preventDefault();
          }
          e.stopPropagation();
          el.scrollTop += e.deltaY * 0.5;
        }}
      >
        <table className="w-full table-fixed border-collapse text-left text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#405755] text-[#b9df36]">
              <th className="w-[50px] border-y border-black px-1 py-1 text-[14px] font-bold">#</th>
              <th className="w-[44%] border-y border-black px-2 py-1 text-[14px] font-bold">
                <div className="flex items-center justify-between gap-3">
                  <span>College</span>
                  <span className="whitespace-nowrap text-[12px] font-normal normal-case tracking-normal text-white">
                    Select a college code to view courses, fees, and college details.
                  </span>
                </div>
              </th>
              <th className="w-[70px] border-y border-black px-1 py-1 text-[14px] font-bold">District</th>
              {courses.map((course) => (
                <th key={course} className="border-y border-black px-1 py-1 text-center text-[14px] font-bold">
                  {course}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courseColleges.map((college, index) => {
              const typeKey = getCollegeType(college.code);
              const { bg } = COLLEGE_TYPE_COLORS[typeKey];
              const offered = college.courses || [];
              return (
                <tr key={college.code} style={{ backgroundColor: bg }}>
                  <td className="border-y border-black px-1 py-0.5 text-[14px] font-normal text-black">
                    {index + 1}
                  </td>
                  <td className="overflow-hidden border-y border-black px-1 py-0.5">
                    <span className="flex min-w-0 items-center gap-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectCollege(college)}
                        className="flex h-[26px] w-[100px] shrink-0 items-center justify-center border border-black bg-transparent px-1 text-[13px] font-bold text-black hover:bg-black/5 focus:outline-none focus:ring-1 focus:ring-[#0000b0]"
                        title={`View details for ${college.name}`}
                      >
                        {college.code}
                      </button>
                      <span className="overflow-hidden text-ellipsis text-[13px] font-normal text-black">({college.name})</span>
                    </span>
                  </td>
                  <td className="border-y border-black px-1 py-0.5 text-center text-[13px] text-black">
                    <span className="inline-flex h-[26px] w-[60px] items-center justify-center border border-black px-1 font-bold">
                      {college.district}
                    </span>
                  </td>
                  {courses.map((course) => {
                    if (!offered.includes(course)) {
                      return <td key={course} className="border-y border-black px-1 py-0.5" />;
                    }
                    const key = `${college.code}_${course}`;
                    const value = preferences[key] ?? "";
                    const isDuplicate = value !== "" && usedCounts[value] > 1;
                    return (
                      <td key={course} className="border-y border-black px-1 py-0.5 text-center">
                        <input
                          type="number"
                          min="1"
                          value={value}
                          onChange={(e) => onPreferenceChange(key, e.target.value)}
                          className={`h-6 w-[58px] border px-1 text-center text-[13px] outline-none focus:border-[#0000b0] ${
                            isDuplicate
                              ? "border-2 border-red-500 bg-red-50"
                              : "border-[#777] bg-white"
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
    </section>
  );
}

export default function PreferenceList({ colleges, preferences, setPreferences }) {
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [search, setSearch] = useState("");

  const filteredColleges = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return colleges;
    return colleges.filter(
      (c) =>
        c.name.toLowerCase().startsWith(term) ||
        c.code.toLowerCase().startsWith(term)
    );
  }, [colleges, search]);

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

  function handlePreferenceChange(key, value) {
    setPreferences((prev) => ({
      ...prev,
      [key]: value === "" ? "" : Number(value),
    }));
  }

  if (colleges.length === 0) {
    return (
      <div className="rounded-md border border-slate-300 bg-white p-8 text-center text-slate-500">
        No colleges found in the selected district(s). Try a different district.
      </div>
    );
  }

  return (
    <div className="overflow-visible border border-[#52647b] text-[13px] text-black" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="border-b border-[#52647b] bg-white px-1 py-1">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 text-[12px] text-[#0000b0]">
          <span className="font-normal">Color Codes for Colleges :</span>
          {Object.entries(COLLEGE_TYPE_COLORS)
            .filter(([key]) => key !== "unknown")
            .map(([key, { bg, label }]) => (
              <span key={key} className="flex items-center gap-1 font-normal">
                {label}
                <span
                  className="inline-block h-5 w-11 border border-[#777]"
                  style={{ backgroundColor: bg }}
                />
              </span>
            ))}
        </div>
        <div className="mt-1 max-w-[260px]">
          <input
            type="text"
            placeholder="Search college name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-6 w-full border border-[#777] px-2 text-[12px] outline-none focus:border-[#0000b0]"
          />
        </div>
      </div>

      {duplicateNumbers.length > 0 && (
        <div className="border-b border-red-300 bg-red-50 px-2 py-1 text-xs font-normal text-red-700">
          Duplicate preference number{duplicateNumbers.length > 1 ? "s" : ""}: {duplicateNumbers.join(", ")}. Each option must have a unique number.
        </div>
      )}

      <div className="space-y-1 overflow-x-auto">
        <CourseTable
          title="MBA Courses"
          courses={MBA_COURSES}
          colleges={filteredColleges}
          preferences={preferences}
          usedCounts={usedCounts}
          onPreferenceChange={handlePreferenceChange}
          onSelectCollege={setSelectedCollege}
        />
        <CourseTable
          title="MCA Courses"
          courses={MCA_COURSES}
          colleges={filteredColleges}
          preferences={preferences}
          usedCounts={usedCounts}
          onPreferenceChange={handlePreferenceChange}
          onSelectCollege={setSelectedCollege}
        />
      </div>

      <CollegeInfoModal college={selectedCollege} onClose={() => setSelectedCollege(null)} />
    </div>
  );
}
