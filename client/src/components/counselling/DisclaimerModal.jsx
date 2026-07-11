export default function DisclaimerModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-md border border-slate-300 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900">
          Unofficial TG ICET Mock Counselling Simulator
        </h3>
        <p className="mt-3 text-sm text-slate-600">
          This tool is for practice and planning only. It is not affiliated with TGCHE or the
          official counselling portal.
        </p>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-brand-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:scale-[1.01] active:scale-[0.99]"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}