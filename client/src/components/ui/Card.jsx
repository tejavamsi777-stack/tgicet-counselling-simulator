import { cn } from "../../utils/cn";

export default function Card({ children, className, glass = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        glass && "bg-white/70 backdrop-blur-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}