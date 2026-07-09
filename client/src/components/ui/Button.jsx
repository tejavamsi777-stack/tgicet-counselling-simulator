import { cn } from "../../utils/cn";

const variants = {
  primary:
    "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-600 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5",

  secondary:
    "bg-white/80 backdrop-blur-xl text-slate-900 border border-white/60 shadow-md hover:bg-white hover:shadow-lg hover:-translate-y-0.5",

  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-medium",
        "transition-all duration-300 ease-out active:scale-95 hover:scale-[1.02]",
        "disabled:opacity-50 disabled:pointer-events-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}