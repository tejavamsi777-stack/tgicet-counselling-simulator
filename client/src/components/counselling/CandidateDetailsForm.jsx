const CATEGORIES = ["OC", "EWS", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST"];
const GENDERS = ["Male", "Female"];

export default function CandidateDetailsForm({
  rank,
  setRank,
  category,
  setCategory,
  gender,
  setGender,
  error,
}) {
  return (
    <div className="rounded-md border border-slate-300 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Your Details</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Rank</label>
          <input
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            placeholder="e.g. 12500"
            className="w-full rounded border border-slate-400 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded border border-slate-400 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded border border-slate-400 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500"
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}