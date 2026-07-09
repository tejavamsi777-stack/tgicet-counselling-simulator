import { cn } from "../../utils/cn";

const tones = {
  safe: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  moderate: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  risky: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  neutral: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  brand: "bg-brand-50 text-brand-700 ring-1 ring-brand-200",
};

export default function Badge({ children, tone = "neutral", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}