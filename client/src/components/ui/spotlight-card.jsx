import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
};

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
  const innerRef = useRef(null);

  // ── Ambient spotlight (desktop/mouse only) ──────────────────────────────
  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    const syncPointer = (e) => {
      const { clientX: x, clientY: y } = e;
      if (cardRef.current) {
        cardRef.current.style.setProperty("--x", x.toFixed(2));
        cardRef.current.style.setProperty("--xp", (x / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty("--y", y.toFixed(2));
        cardRef.current.style.setProperty("--yp", (y / window.innerHeight).toFixed(2));
      }
    };

    document.addEventListener("pointermove", syncPointer);
    return () => document.removeEventListener("pointermove", syncPointer);
  }, []);

  // ── 3-D tilt (desktop/mouse only) ───────────────────────────────────────
  const isFinePointer = typeof window !== "undefined"
    ? window.matchMedia("(pointer: fine)").matches
    : false;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Spring-damped so the card eases back smoothly
  const springX = useSpring(rawX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e) => {
    if (!isFinePointer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // Normalise to -0.5 … 0.5
    rawX.set((e.clientX - rect.left - rect.width  / 2) / rect.width);
    rawY.set((e.clientY - rect.top  - rect.height / 2) / rect.height);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  // ── Sizing ───────────────────────────────────────────────────────────────
  const { base, spread } = glowColorMap[glowColor] || glowColorMap.purple;

  const getSizeClasses = () => {
    if (customSize) return "";
    return sizeMap[size] || sizeMap.md;
  };

  const getInlineStyles = () => {
    const baseStyles = {
      "--base": base,
      "--spread": spread,
      "--radius": "16",
      "--border": "1.5",
      "--backdrop": "rgba(255, 255, 255, 0.05)",
      "--backup-border": "rgba(255, 255, 255, 0.1)",
      "--size": "240",
      "--outer": "1",
      "--border-size": "calc(var(--border, 1.5) * 1px)",
      "--spotlight-size": "calc(var(--size, 240) * 1px)",
      "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 280) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.15)), transparent
      )`,
      backgroundColor: "var(--backdrop, transparent)",
      backgroundSize: "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
      backgroundPosition: "50% 50%",
      backgroundAttachment: "fixed",
      border: "var(--border-size) solid var(--backup-border)",
      position: "relative",
      touchAction: "pan-y",
    };

    if (width !== undefined) baseStyles.width  = typeof width  === "number" ? `${width}px`  : width;
    if (height !== undefined) baseStyles.height = typeof height === "number" ? `${height}px` : height;

    return baseStyles;
  };

  return (
    <div style={{ perspective: "1000px" }}>
      <motion.div
        ref={cardRef}
        data-glow
        style={{
          ...getInlineStyles(),
          rotateX: (isFinePointer && tilt) ? rotateX : 0,
          rotateY: (isFinePointer && tilt) ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={(isFinePointer && tilt) ? handleMouseMove : undefined}
        onMouseLeave={(isFinePointer && tilt) ? handleMouseLeave : undefined}
        className={`
          ${getSizeClasses()}
          rounded-2xl 
          relative 
          flex flex-col justify-between
          shadow-xl
          p-3.5 sm:p-6
          backdrop-blur-xl
          transition-shadow duration-300
          hover:shadow-2xl
          ${className}
        `}
      >
        <div ref={innerRef} data-glow></div>
        {children}
      </motion.div>
    </div>
  );
}
