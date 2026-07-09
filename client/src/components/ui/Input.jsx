import { cn } from "../../utils/cn";

export default function Input({ label, className, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900",
          "placeholder:text-slate-400",
          "transition-all duration-200",
          "focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
          className
        )}
        {...props}
      />
    </div>
  );
}