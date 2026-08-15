import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function Logo({ size = 34 }) {
  const containerRef = useRef(null);
  const ringRef = useRef(null);
  const capRef = useRef(null);
  const starRef = useRef(null);
  const rayRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Continuous slow ambient orbit
      gsap.to(ringRef.current, {
        rotation: 360,
        transformOrigin: "32px 32px",
        duration: 18,
        repeat: -1,
        ease: "none",
      });

      // 2. Subtle ambient beacon pulse
      gsap.to(starRef.current, {
        scale: 1.5,
        opacity: 1,
        transformOrigin: "32px 28px",
        yoyo: true,
        repeat: -1,
        duration: 1.4,
        ease: "sine.inOut",
      });

      // 3. Gentle float breathing for the cap
      gsap.to(capRef.current, {
        y: -1.5,
        yoyo: true,
        repeat: -1,
        duration: 2.2,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = () => {
    // Interactive GSAP flare & elastic bounce on hover
    gsap.to(capRef.current, {
      scale: 1.12,
      y: -3,
      transformOrigin: "32px 32px",
      duration: 0.45,
      ease: "back.out(2)",
    });

    gsap.to(ringRef.current, {
      scale: 1.08,
      rotation: "+=90",
      transformOrigin: "32px 32px",
      duration: 0.6,
      ease: "power2.out",
    });

    gsap.to(rayRef.current, {
      scaleY: 1.3,
      opacity: 1,
      transformOrigin: "32px 20px",
      duration: 0.35,
      ease: "power2.out",
    });

    gsap.to(starRef.current, {
      scale: 2.2,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(capRef.current, {
      scale: 1,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
    });

    gsap.to(ringRef.current, {
      scale: 1,
      duration: 0.5,
      ease: "power2.out",
    });

    gsap.to(rayRef.current, {
      scaleY: 1,
      opacity: 0.85,
      duration: 0.4,
      ease: "power2.out",
    });

    gsap.to(starRef.current, {
      scale: 1,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="glass-button-wrap relative inline-flex cursor-pointer select-none"
    >
      <div
        className="glass-button flex items-center justify-center rounded-2xl border border-white/30 bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_6px_20px_rgba(124,58,237,0.25)] transition-all duration-300"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 64 64"
          width={size * 0.78}
          height={size * 0.78}
          fill="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="logoCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="logoRingGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
            </linearGradient>
            <filter id="logoGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* GSAP Rotating Orbital Target Ring */}
          <g ref={ringRef}>
            <circle
              cx="32"
              cy="32"
              r="23"
              stroke="url(#logoRingGrad)"
              strokeWidth="1.6"
              strokeDasharray="4 4"
              opacity="0.6"
            />
            <circle
              cx="32"
              cy="9"
              r="2.2"
              fill="#38bdf8"
              filter="url(#logoGlow)"
            />
            <circle
              cx="55"
              cy="32"
              r="1.8"
              fill="#c084fc"
              filter="url(#logoGlow)"
            />
          </g>

          {/* Upward Guidance Compass Ray */}
          <g ref={rayRef}>
            <path
              d="M32 10 L35 23 L32 19 L29 23 Z"
              fill="#38bdf8"
              opacity="0.85"
              filter="url(#logoGlow)"
            />
          </g>

          {/* GSAP Floating Mortarboard Graduation Emblem */}
          <g ref={capRef}>
            {/* Top Diamond Crown */}
            <path
              d="M32 19 L49 28 L32 37 L15 28 Z"
              fill="url(#logoCapGrad)"
              filter="url(#logoGlow)"
            />
            <path
              d="M32 19 L49 28 L32 37 L15 28 Z"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinejoin="round"
              opacity="0.95"
            />

            {/* Base Arch */}
            <path
              d="M22 33 V41 C22 44.5 42 44.5 42 41 V33"
              stroke="url(#logoCapGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Tassel Ribbon */}
            <path
              d="M41 28.5 L46 36 L46 41"
              stroke="#fbcfe8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="46" cy="41" r="1.5" fill="#f472b6" />
          </g>

          {/* GSAP Pulsing Beacon Star */}
          <g ref={starRef}>
            <circle
              cx="32"
              cy="28"
              r="2.5"
              fill="#ffffff"
              filter="url(#logoGlow)"
            />
          </g>
        </svg>
      </div>
      <div className="glass-button-shadow rounded-2xl"></div>
    </div>
  );
}