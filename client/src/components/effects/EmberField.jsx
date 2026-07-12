import { useEffect, useRef } from "react";

const COLORS = ["#7c3aed", "#22d3ee", "#fbbf24", "#f472b6"];

/**
 * Canvas ember/spark field — particles spawn at the bottom, drift upward
 * with gentle horizontal sway, glow, and fade out. Loops forever.
 * IMPORTANT: frame id is captured and cancelled on cleanup (unlike a past
 * bug we hit with an uncancelled RAF loop) so this never leaks across
 * remounts/HMR.
 */
export default function EmberField({ density = 55 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frameId;
    let particles = [];
    let width = 0;
    let height = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function spawn() {
      return {
        x: Math.random() * width,
        y: height + Math.random() * 40,
        r: Math.random() * 2 + 1,
        speed: Math.random() * 0.6 + 0.25,
        drift: (Math.random() - 0.5) * 0.6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        maxLife: Math.random() * 300 + 200,
      };
    }

    resize();
    particles = Array.from({ length: density }, spawn);
    window.addEventListener("resize", resize);

    function tick() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, i) => {
        p.y -= p.speed;
        p.x += p.drift;
        p.life += 1;

        const lifeRatio = p.life / p.maxLife;
        const opacity = lifeRatio < 0.15
          ? lifeRatio / 0.15
          : lifeRatio > 0.85
          ? (1 - lifeRatio) / 0.15
          : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, opacity) * 0.7;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        if (p.y < -10 || p.life > p.maxLife) {
          particles[i] = spawn();
        }
      });

      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}