import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Select({ label, options, className, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-900",
            "transition-all duration-200",
            "focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}