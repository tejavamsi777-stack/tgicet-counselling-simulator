const STEPS = [
  { key: "candidate", label: "Your Details" },
  { key: "details", label: "Course & Districts" },
  { key: "list", label: "Option Entry" },
];

export default function StepIndicator({ step }) {
  const activeIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto flex max-w-md items-center justify-between">
      {STEPS.map((s, i) => {
        const isActive = i === activeIndex;
        const isDone = i < activeIndex;
        return (
          <div key={s.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isDone
                    ? "bg-gradient-to-tr from-[#312e81] to-[#0e7490] text-white"
                    : isActive
                    ? "border-2 border-[#7c3aed] text-[#7c3aed]"
                    : "border-2 border-slate-200 text-slate-400"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`mt-1.5 text-[11px] font-medium ${
                  isActive ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 mb-4 h-0.5 flex-1 rounded ${
                  isDone ? "bg-gradient-to-r from-[#312e81] to-[#0e7490]" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}