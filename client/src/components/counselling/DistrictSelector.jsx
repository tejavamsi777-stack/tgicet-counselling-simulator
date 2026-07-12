import { Fragment } from "react";
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

export default function DistrictSelector({ districts, selectedDistricts, setSelectedDistricts, error }) {
  function toggleDistrict(district) {
    setSelectedDistricts((prev) =>
      prev.includes(district)
        ? prev.filter((d) => d !== district)
        : [...prev, district]
    );
  }

  return (
    <div className="bg-white border border-black text-black text-base" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="bg-[#3b3b1f] text-white text-center py-2 font-bold">
        Select desired Districts
        <div className="text-sm font-normal">(Atleast ONE District should be selected)</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr]">
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
              className="text-sm font-semibold text-blue-700 hover:underline"
            >
              {selectedDistricts.length === districts.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="px-4 py-3 space-y-1.5">
            {districts.map((d) => (
              <label key={d} className="flex items-center gap-2 text-base text-black">
                <input
                  type="checkbox"
                  checked={selectedDistricts.includes(d)}
                  onChange={() => toggleDistrict(d)}
                  className="h-4 w-4"
                />
                {d}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-[#cfe2f3] text-center font-semibold py-1.5 border-b border-black">
            Group of Branches
          </div>
          <div className="p-3">
            <table className="w-full border-collapse text-base">
              <thead>
                <tr className="border border-black bg-white">
                  <th className="border border-black px-2 py-1.5">S.No</th>
                  <th className="border border-black px-2 py-1.5">Branch Code</th>
                  <th className="border border-black px-2 py-1.5 text-left">Branch Name</th>
                </tr>
              </thead>
              <tbody>
                {COURSE_GROUPS.map((g) => (
  <Fragment key={g.group}>
    <tr>
                      <td colSpan={3} className="border border-black bg-[#cfe2f3] text-center font-semibold py-1.5">
                        {g.group}
                      </td>
                    </tr>
                    {g.branches.map((b, i) => (
                      <tr key={b.code}>
                        <td className="border border-black px-2 py-1.5 text-center">{i + 1}</td>
                        <td className="border border-black px-2 py-1.5 text-center">{b.code}</td>
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
  );
}