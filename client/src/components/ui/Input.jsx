import { cn } from "../../lib/utils";

export default function Input({ label, className, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-gray-300">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "h-11 rounded-2xl border border-white/15 bg-white/5 px-4 text-sm text-white backdrop-blur-md",
          "placeholder:text-gray-400",
          "transition-all duration-200",
          "focus:outline-none focus:border-white/30 focus:bg-white/10",
          className
        )}
        {...props}
      />
    </div>
  );
}