import { useReferenceData } from "../../hooks/useReferenceData";

export default function PreferenceForm({ course, setCourse }) {
  const { courses } = useReferenceData();

  return (
    <div className="rounded-md border border-slate-300 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Select Course</h3>
      <div className="max-w-xs">
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="w-full rounded border border-slate-400 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500"
        >
          {courses.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}