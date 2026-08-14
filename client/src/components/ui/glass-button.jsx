import React from "react";
import { cn } from "../../lib/utils";

const glassButtonVariants = (size = "default") => {
  const sizes = {
    default: "text-base font-semibold",
    sm: "text-sm font-semibold",
    lg: "text-lg font-semibold",
    icon: "h-10 w-10 flex items-center justify-center",
  };
  return cn(
    "relative isolate all-unset cursor-pointer rounded-full transition-all font-semibold text-white",
    sizes[size] || sizes.default
  );
};

const glassButtonTextVariants = (size = "default") => {
  const sizes = {
    default: "px-6 py-3.5",
    sm: "px-4 py-2 text-xs sm:text-sm",
    lg: "px-8 py-4",
    icon: "flex h-10 w-10 items-center justify-center",
  };
  return cn(
    "glass-button-text relative block select-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]",
    sizes[size] || sizes.default
  );
};

const GlassButton = React.forwardRef(
  ({ className, children, size = "default", contentClassName, ...props }, ref) => {
    return (
      <div
        className={cn(
          "glass-button-wrap cursor-pointer rounded-full inline-block",
          className
        )}
      >
        <button
          className={cn("glass-button", glassButtonVariants(size))}
          ref={ref}
          {...props}
        >
          <span
            className={cn(
              glassButtonTextVariants(size),
              contentClassName
            )}
          >
            {children}
          </span>
        </button>
        <div className="glass-button-shadow rounded-full"></div>
      </div>
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
