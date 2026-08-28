import React from "react";
import { cn } from "../../lib/utils";

const glassButtonVariants = (size = "default") => {
  const sizes = {
    default: "text-sm font-semibold",
    sm: "text-xs font-semibold",
    md: "text-sm font-semibold",
    lg: "text-sm sm:text-base font-semibold",
    xl: "text-base font-bold",
    icon: "h-10 w-10 flex items-center justify-center",
  };
  return cn(
    "relative isolate all-unset cursor-pointer rounded-full transition-all font-semibold text-white",
    sizes[size] || sizes.default
  );
};

const glassButtonTextVariants = (size = "default") => {
  const sizes = {
    default: "px-5 py-2.5 text-sm",
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-2.5 text-sm sm:text-base",
    xl: "px-7 py-3 text-base",
    icon: "flex h-10 w-10 items-center justify-center",
  };
  return cn(
    "glass-button-text relative flex items-center justify-center select-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]",
    sizes[size] || sizes.default
  );
};

const GlassButton = React.forwardRef(
  ({ className, children, size = "default", variant = "default", contentClassName, ...props }, ref) => {
    const isRed = variant === "red";
    return (
      <div
        className={cn(
          "glass-button-wrap cursor-pointer rounded-full inline-block",
          className
        )}
      >
        <button
          className={cn(
            isRed ? "glass-button-red" : "glass-button",
            glassButtonVariants(size)
          )}
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
        <div className={isRed ? "glass-button-shadow-red rounded-full" : "glass-button-shadow rounded-full"}></div>
      </div>
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
