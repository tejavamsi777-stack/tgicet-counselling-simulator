import collegeTypes from "../../data/collegeTypes.json";

export default function CollegeInfoModal({ college, onClose }) {
  if (!college) return null;

  const info = collegeTypes[college.code];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-md border border-slate-300 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <h3 className="text-lg font-bold text-black">
          {college.name} ({college.code})
        </h3>

        <div className="mt-4 space-y-2 text-sm text-slate-800">
          <p>
            <span className="font-semibold">District</span> : {college.district}
          </p>
          <p>
            <span className="font-semibold">Type of College</span> :{" "}
            <span className="font-bold">
              {info ? info.ownershipLabel : "Not available"}
            </span>
          </p>
          <p>
            <span className="font-semibold">Minority</span> :{" "}
            <span className="font-bold">{info ? (info.minority ? "YES" : "NA") : "Not available"}</span>
            ; <span className="font-semibold">Co-Education</span> :{" "}
            <span className="font-bold">
              {info ? (info.coEd ? "COED" : "WOMENS") : "Not available"}
            </span>
          </p>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}