import { Fragment, useState, useEffect, useRef } from "react";
import { getDistrictName } from "../../utils/districtNames";

const COURSE_GROUPS = [
  {
    group: "GROUP MBA",
    branches: [
      { code: "MBA", name: "MASTER OF BUSINESS ADMINISTRATION" },
      { code: "MBT", name: "MBA - TRAVEL AND TOURISM MANAGEMENT/ TOURISM AND TRAVEL MANAGEMENT" },
      { code: "MTM", name: "MBA -TECHNOLOGY MANAGEMENT" },
    ],
  },
  {
    group: "GROUP MCA",
    branches: [{ code: "MCA", name: "MASTER OF COMPUTER APPLICATIONS" }],
  },
];

export default function DistrictSelector({ districts, selectedDistricts, setSelectedDistricts, error, courseGroups = COURSE_GROUPS }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState("auto");

  function toggleDistrict(district) {
    setSelectedDistricts((prev) =>
      prev.includes(district)
        ? prev.filter((d) => d !== district)
        : [...prev, district]
    );
  }

  // Automatic Mobile Zoom-Out to fit entire PC table into screen width without horizontal scrolling
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current || !contentRef.current) return;
      const availableWidth = containerRef.current.clientWidth;
      const targetWidth = 720; // Full PC table width
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
  }, [districts, courseGroups]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden text-black" style={{ height: scaledHeight }}>
      <div
        ref={contentRef}
        className="bg-white border border-black text-base"
        style={{
          fontFamily: "Arial, sans-serif",
          width: scale < 1 ? "720px" : "100%",
          transform: scale < 1 ? `scale(${scale})` : "none",
          transformOrigin: "top left",
        }}
      >
        {/* Top Header */}
        <div className="bg-[#3b3b1f] text-white text-center py-2 font-bold">
          Select desired Districts
          <div className="text-sm font-normal">(Atleast ONE District should be selected)</div>
        </div>

        {/* 2-Column Full PC Layout (All districts shown without inner cutoff) */}
        <div className="grid grid-cols-[220px_1fr] border-b border-black">
          {/* Left Column: Districts Checklist */}
          <div className="border-r border-black">
            <div className="bg-[#cfe2f3] text-center font-semibold py-1.5 border-b border-black">OU</div>
            <div className="px-4 py-3 text-sm text-blue-700 text-center border-b border-black">
              Choose One or more Districts and
              <br />
              Click on "Display Option Entry Form"
            </div>
            <div className="px-4 py-2 border-b border-black">
              <button
                type="button"
                onClick={() =>
                  setSelectedDistricts(
                    selectedDistricts.length === districts.length ? [] : [...districts]
                  )
                }
                className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                {selectedDistricts.length === districts.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            {/* Display ALL districts naturally without fixed scroll height */}
            <div className="px-4 py-3 space-y-1.5">
              {districts.map((d) => (
                <label key={d} className="flex items-center gap-2 text-sm text-black cursor-pointer hover:bg-black/5 px-1 py-0.5 rounded select-none">
                  <input
                    type="checkbox"
                    checked={selectedDistricts.includes(d)}
                    onChange={() => toggleDistrict(d)}
                    className="h-4 w-4 cursor-pointer shrink-0"
                  />
                  <span>{getDistrictName(d)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Right Column: Group of Branches Table */}
          <div>
            <div className="bg-[#cfe2f3] text-center font-semibold py-1.5 border-b border-black">
              Group of Branches
            </div>
            <div className="p-3">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border border-black bg-white">
                    <th className="border border-black px-2 py-1.5 w-14 text-center">S.No</th>
                    <th className="border border-black px-2 py-1.5 w-28 text-center">Branch Code</th>
                    <th className="border border-black px-2 py-1.5 text-left">Branch Name</th>
                  </tr>
                </thead>
                <tbody>
                  {courseGroups.map((g) => (
                    <Fragment key={g.group}>
                      <tr>
                        <td colSpan={3} className="border border-black bg-[#cfe2f3] text-center font-semibold py-1.5">
                          {g.group}
                        </td>
                      </tr>
                      {g.branches.map((b, i) => (
                        <tr key={b.code}>
                          <td className="border border-black px-2 py-1.5 text-center">{i + 1}</td>
                          <td className="border border-black px-2 py-1.5 text-center font-semibold">{b.code}</td>
                          <td className="border border-black px-2 py-1.5">{b.name}</td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {error && <p className="px-4 py-2 text-sm font-medium text-red-600">{error}</p>}
      </div>
    </div>
  );
}
