import React, { useRef, useState } from "react";
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
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const isFinePointer = typeof window !== "undefined"
    ? window.matchMedia("(pointer: fine)").matches
    : false;

  // 3-D tilt
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springX = useSpring(rawX, { stiffness: 220, damping: 22 });
  const springY = useSpring(rawY, { stiffness: 220, damping: 22 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e) => {
    if (!isFinePointer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    if (tilt) {
      rawX.set((x - rect.width / 2) / rect.width);
      rawY.set((y - rect.height / 2) / rect.height);
    }
  };

  const handleMouseEnter = () => {
    if (isFinePointer) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
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
        ref={cardRef}
        style={{
          ...inlineStyles,
          rotateX: (isFinePointer && tilt) ? rotateX : 0,
          rotateY: (isFinePointer && tilt) ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          ${getSizeClasses()}
          group relative flex flex-col justify-between overflow-hidden
          rounded-2xl border border-white/10 bg-[#121118]/80
          p-4 sm:p-6 backdrop-blur-xl
          transition-all duration-300
          hover:border-white/25 hover:bg-[#161420]/90 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]
          ${className}
        `}
      >
        {/* Gentle, normal-brightness cursor spotlight (no stains, no text washout) */}
        {isFinePointer && (
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.06), transparent 80%)`,
            }}
          />
        )}

        <div className="relative z-10 flex h-full flex-col justify-between">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
