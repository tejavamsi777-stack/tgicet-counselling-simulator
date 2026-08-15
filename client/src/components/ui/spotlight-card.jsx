import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

export function GlowCard({
  children,
  className = "",
  glowColor = "purple",
  size = "md",
  width,
  height,
  customSize = false,
  tilt = false,
}) {
  const isFinePointer = typeof window !== "undefined"
    ? window.matchMedia("(pointer: fine)").matches
    : false;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Spring-damped so the card eases back smoothly
  const springX = useSpring(rawX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e) => {
    if (!isFinePointer || !tilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    rawY.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const getSizeClasses = () => {
    if (customSize) return "";
    return sizeMap[size] || sizeMap.md;
  };

  const inlineStyles = {};
  if (width !== undefined) inlineStyles.width = typeof width === "number" ? `${width}px` : width;
  if (height !== undefined) inlineStyles.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div style={{ perspective: "1000px" }}>
      <motion.div
        style={{
          ...inlineStyles,
          rotateX: (isFinePointer && tilt) ? rotateX : 0,
          rotateY: (isFinePointer && tilt) ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`
          ${getSizeClasses()}
          relative flex flex-col justify-between
          rounded-2xl border border-white/10 bg-white/[0.035]
          p-4 sm:p-6 backdrop-blur-xl
          transition-all duration-300
          hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]
          ${className}
        `}
      >
        {children}
      </motion.div>
    </div>
  );
}
