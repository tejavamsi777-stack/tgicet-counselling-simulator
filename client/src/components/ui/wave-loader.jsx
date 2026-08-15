"use client";

import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const waveLoaderVariants = cva("flex gap-2 items-center justify-center", {
  variants: {
    messagePlacement: {
      bottom: "flex-col",
      right: "flex-row",
      left: "flex-row-reverse",
    },
  },
  defaultVariants: {
    messagePlacement: "bottom",
  },
});

export function WaveLoader({
  bars = 5,
  message,
  messagePlacement,
  className,
  barClassName,
  ...props
}) {
  return (
    <div className={cn(waveLoaderVariants({ messagePlacement }))}>
      <div className="flex gap-1.5 items-center justify-center">
        {Array(bars)
          .fill(undefined)
          .map((_, index) => (
            <motion.div
              key={index}
              className={cn("w-2 h-7 bg-white rounded-sm origin-bottom", barClassName, className)}
              animate={{ scaleY: [0.3, 1.4, 0.3] }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.12,
                ease: "easeInOut",
              }}
              {...props}
            />
          ))}
      </div>
      {message && <div className="text-sm font-medium text-gray-300 mt-3">{message}</div>}
    </div>
  );
}
