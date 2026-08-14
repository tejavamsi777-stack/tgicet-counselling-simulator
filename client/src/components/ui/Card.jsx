import { cn } from "../../lib/utils";

export default function Card({ children, className, glass = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/15 bg-white/5 backdrop-blur-2xl text-white shadow-[0_16px_48px_rgba(0,0,0,0.4)]",
        glass && "bg-white/5 backdrop-blur-3xl border-white/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}