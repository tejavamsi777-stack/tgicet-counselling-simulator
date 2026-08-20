import { useMemo, useState, useEffect, useRef } from "react";
import { COLLEGE_TYPE_COLORS } from "../../utils/collegeTypeColors";
import { getDistrictName } from "../../utils/districtNames";
import CollegeInfoModal from "./CollegeInfoModal";

/**
 * Derive college type from live DB flags.
 */
function deriveCollegeType(college) {
  if (college.is_girls) return "girls";
  if (college.is_minority) return "minority";

  const ownership = (college.ownership_type || "").toUpperCase();
  const name = (college.name || "").toUpperCase();

  // Government / University Colleges (Cyan #62c4ea)
  if (
    ownership === "UNIV" ||
    ownership === "GOV" ||
    ownership === "GOVT" ||
    ownership.includes("GOV") ||
    ownership.includes("UNIV") ||
    name.includes("GOVT") ||
    name.includes("GOVERNMENT")
  ) {
    return "univ";
  }

  // Self Finance (Grey #999999)
  if (college.is_self_finance || ownership === "SF" || ownership.includes("SELF")) {
    return "sf";
  }

  // Private (Light Yellow #fdf4a6)
  return "pvt";
}

function CourseTable({ title, courses, colleges, preferences, usedCounts, onPreferenceChange, onSelectCollege }) {
  const courseColleges = colleges.filter((college) =>
    courses.some((course) => college.courses?.includes(course))
  );

  if (courseColleges.length === 0) return null;

  return (
    <section className="mb-2">
      <p className="px-1 pb-1 text-xs font-semibold text-white tracking-wide">{title}</p>
      <div className="border border-[#52647b] select-text">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#405755] text-[#b9df36]">
              <th className="w-[42px] border-y border-black px-1 py-1.5 text-center text-[13px] font-bold">#</th>
              <th className="w-[105px] border-y border-black px-2 py-1.5 text-center text-[13px] font-bold">
                College
              </th>
              <th className="border-y border-black px-2 py-1.5 text-center text-[12px] font-normal normal-case tracking-normal text-white min-w-[220px]">
                Select a college code to view courses, fees, and college details
              </th>
              <th className="w-[140px] border-y border-black px-2 py-1.5 text-center text-[13px] font-bold text-[#b9df36]">
                District
              </th>
              {courses.map((course) => (
                <th key={course} className="w-[65px] border-y border-black px-1 py-1.5 text-center text-[13px] font-bold">
                  {course}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courseColleges.map((college, index) => {
              const typeKey = deriveCollegeType(college);
              const { bg } = COLLEGE_TYPE_COLORS[typeKey];
              const offered = college.courses || [];
              const districtDisplay = college.districtName || getDistrictName(college.district);
              return (
                <tr key={college.code} style={{ backgroundColor: bg }}>
                  <td className="border-y border-black px-1 py-0.5 text-center text-[13px] font-normal text-black">
                    {index + 1}
                  </td>
                  <td className="border-y border-black px-1 py-0.5 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectCollege(college)}
                      className="inline-flex h-[26px] w-[92px] items-center justify-center border border-black bg-transparent px-1 text-[13px] font-bold text-black hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-[#0000b0] cursor-pointer"
                      title={`View details for ${college.name}`}
                    >
                      {college.code}
                    </button>
                  </td>
                  <td className="border-y border-black px-2 py-0.5 text-left text-[13px] font-normal text-black">
                    ({college.name})
                  </td>
                  <td className="border-y border-black px-1 py-0.5 text-center text-[13px] text-black">
                    <span className="inline-flex h-[26px] min-w-[80px] items-center justify-center border border-black bg-white/30 px-2 text-[12px] font-semibold text-black">
                      {districtDisplay}
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
                          className={`h-6 w-[56px] border px-1 text-center text-[13px] outline-none focus:border-[#0000b0] ${
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

export default function PreferenceList({ colleges, preferences, setPreferences, courseGroups }) {
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [search, setSearch] = useState("");

  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState("auto");

  const filteredColleges = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return colleges;
    return colleges.filter(
      (c) =>
        c.name.toLowerCase().startsWith(term) ||
        c.code.toLowerCase().startsWith(term)
    );
  }, [colleges, search]);

  const activeCourseGroups = useMemo(() => {
    if (courseGroups && courseGroups.length > 0) return courseGroups;

    const allCourses = Array.from(
      new Set(colleges.flatMap((c) => c.courses || []))
    ).sort();

    if (allCourses.length === 0) return [];

    const isMbaMca = allCourses.some((c) => ["MBA", "MCA", "MBT", "MTM"].includes(c));
    if (isMbaMca) {
      const mba = allCourses.filter((c) => ["MBA", "MBT", "MTM"].includes(c));
      const mca = allCourses.filter((c) => c === "MCA");
      const groups = [];
      if (mba.length > 0) groups.push({ title: "MBA Courses", courses: mba });
      if (mca.length > 0) groups.push({ title: "MCA Courses", courses: mca });
      return groups;
    }

    return allCourses.map((c) => ({ title: `${c} Courses`, courses: [c] }));
  }, [courseGroups, colleges]);

  const maxCoursesInGroup = useMemo(() => {
    if (activeCourseGroups.length === 0) return 3;
    return Math.max(...activeCourseGroups.map((g) => g.courses.length));
  }, [activeCourseGroups]);

  const targetWidth = useMemo(() => {
    // 560 base width + 65px per course branch column
    return Math.max(760, 560 + maxCoursesInGroup * 68);
  }, [maxCoursesInGroup]);

  // Automatic Mobile Zoom-Out to fit entire PC table into screen width without horizontal scrolling
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current || !contentRef.current) return;
      const availableWidth = containerRef.current.clientWidth;
      if (availableWidth > 0 && availableWidth < targetWidth) {
        const newScale = availableWidth / targetWidth;
        setScale(newScale);
        const rawHeight = contentRef.current.scrollHeight || contentRef.current.offsetHeight;
        setScaledHeight(`${rawHeight * newScale}px`);
      } else {
        setScale(1);
        setScaledHeight("auto");
      }
    }

    handleResize();
    const timer = setTimeout(handleResize, 100);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [targetWidth, filteredColleges, activeCourseGroups]);

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
    <div ref={containerRef} className="w-full overflow-hidden" style={{ height: scaledHeight }}>
      <div
        ref={contentRef}
        className="border border-[#52647b] text-[13px] text-black bg-white"
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          width: scale < 1 ? `${targetWidth}px` : "100%",
          transform: scale < 1 ? `scale(${scale})` : "none",
          transformOrigin: "top left",
        }}
      >
        {/* Top Legend & Search */}
        <div className="border-b border-[#52647b] bg-white px-2 py-1.5">
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1.5 text-[12px] text-[#0000b0]">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-normal">Color Codes for Colleges :</span>
              {Object.entries(COLLEGE_TYPE_COLORS)
                .filter(([key]) => key !== "unknown")
                .map(([key, { bg, label }]) => (
                  <span key={key} className="flex items-center gap-1 font-normal">
                    {label}
                    <span
                      className="inline-block h-4 w-9 border border-[#777]"
                      style={{ backgroundColor: bg }}
                    />
                  </span>
                ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="mt-1.5 max-w-[280px]">
            <input
              type="text"
              placeholder="Search college name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-6 w-full border border-[#777] px-2 text-[12px] outline-none focus:border-[#0000b0] bg-white"
            />
          </div>
        </div>

        {duplicateNumbers.length > 0 && (
          <div className="border-b border-red-300 bg-red-50 px-2 py-1 text-xs font-normal text-red-700">
            Duplicate preference number{duplicateNumbers.length > 1 ? "s" : ""}: {duplicateNumbers.join(", ")}. Each option must have a unique number.
          </div>
        )}

        {/* Full PC Table Content */}
        <div className="w-full space-y-1 p-0.5">
          {activeCourseGroups.map((group) => (
            <CourseTable
              key={group.title}
              title={group.title}
              courses={group.courses}
              colleges={filteredColleges}
              preferences={preferences}
              usedCounts={usedCounts}
              onPreferenceChange={handlePreferenceChange}
              onSelectCollege={setSelectedCollege}
            />
          ))}
        </div>

        <CollegeInfoModal college={selectedCollege} onClose={() => setSelectedCollege(null)} />
      </div>
    </div>
  );
}
