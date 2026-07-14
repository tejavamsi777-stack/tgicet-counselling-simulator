import { useEffect, useRef, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Four distinct silhouettes — different widths/heights so the group reads as
// tall / medium / short / medium, all bottom-aligned like a little crowd.
const CHARACTER_SPECS = [
  { key: "tall", W: 46, H: 92, bodyTop: 4, bodyH: 62, rx: 22, legLen: 20, color: "#e11d48" },
  { key: "medium", W: 58, H: 74, bodyTop: 12, bodyH: 48, rx: 24, legLen: 12, color: "#0891b2" },
  { key: "short", W: 62, H: 56, bodyTop: 22, bodyH: 34, rx: 17, legLen: 6, color: "#7c3aed" },
  { key: "medium2", W: 54, H: 82, bodyTop: 10, bodyH: 54, rx: 22, legLen: 16, color: "#2563eb" },
];

function Character({ spec, mouse, stage }) {
  const { W, H, bodyTop, bodyH, rx, legLen, color } = spec;
  const bodyRef = useRef(null);
  const gradId = useId();
  const [pupil, setPupil] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (stage !== "watching" || !mouse || !bodyRef.current) return;
    const rect = bodyRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouse.x - cx;
    const dy = mouse.y - cy;
    const dist = Math.min(Math.hypot(dx, dy), 60);
    const angle = Math.atan2(dy, dx);
    setPupil({
      x: Math.cos(angle) * clamp(dist / 60, 0, 1) * 3,
      y: Math.sin(angle) * clamp(dist / 60, 0, 1) * 3,
    });
  }, [mouse, stage]);

  const eyesHidden = stage === "hiding";
  const peeking = stage === "peeking";
  const celebrating = stage === "celebrating";

  const bodyBottom = bodyTop + bodyH;
  const centerX = W / 2;
  const eyeLX = W * 0.36;
  const eyeRX = W * 0.64;
  const eyeY = bodyTop + bodyH * 0.36;
  const eyeR = bodyH * 0.15;
  const mouthY = bodyTop + bodyH * 0.62;

  const pawRestY = bodyTop + bodyH * 0.72;
  const pawHideY = bodyTop + bodyH * 0.38;
  const pawPeekY = bodyTop + bodyH * 0.5;
  const pawY = eyesHidden ? pawHideY : peeking ? pawPeekY : pawRestY;
  const pawSpread = W * 0.06;
  const pawLX = W * 0.18;
  const pawRX = W * 0.82;

  const legY1 = bodyBottom;
  const legY2 = bodyBottom + legLen;
  const legLX = centerX - W * 0.13;
  const legRX = centerX + W * 0.13;

  return (
    <motion.div
      ref={bodyRef}
      animate={celebrating ? { y: [0, -8, 0, -5, 0] } : { y: 0 }}
      transition={celebrating ? { duration: 0.7, repeat: Infinity, repeatDelay: 0.15 } : {}}
      className="relative flex items-end"
      style={{ width: W * 0.72, height: H * 0.72 }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={W * 0.72} height={H * 0.72}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0.68" />
          </linearGradient>
        </defs>

        {/* legs */}
        <line x1={legLX} y1={legY1} x2={legLX} y2={legY2} stroke={color} strokeWidth="5" strokeLinecap="round" />
        <line x1={legRX} y1={legY1} x2={legRX} y2={legY2} stroke={color} strokeWidth="5" strokeLinecap="round" />

        {/* body */}
        <rect x={W * 0.09} y={bodyTop} width={W * 0.82} height={bodyH} rx={rx} fill={`url(#${gradId})`} />

        {/* eye sockets */}
        <circle cx={eyeLX} cy={eyeY} r={eyeR} fill="white" />
        <circle cx={eyeRX} cy={eyeY} r={eyeR} fill="white" />

        {/* pupils */}
        {!eyesHidden && (
          <>
            <motion.circle
              cx={eyeLX + pupil.x}
              cy={eyeY + pupil.y}
              r={celebrating ? eyeR * 0.6 : eyeR * 0.46}
              fill="#1e1b4b"
              animate={celebrating ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.5, repeat: celebrating ? Infinity : 0 }}
            />
            <motion.circle
              cx={eyeRX + pupil.x}
              cy={eyeY + pupil.y}
              r={celebrating ? eyeR * 0.6 : eyeR * 0.46}
              fill="#1e1b4b"
              animate={celebrating ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.5, repeat: celebrating ? Infinity : 0 }}
            />
          </>
        )}

        {/* mouth */}
        <motion.path
          d={
            celebrating
              ? `M ${centerX - 6} ${mouthY} Q ${centerX} ${mouthY + 8} ${centerX + 6} ${mouthY}`
              : peeking
              ? `M ${centerX - 5} ${mouthY + 1} Q ${centerX} ${mouthY + 4} ${centerX + 5} ${mouthY + 1} Q ${centerX} ${mouthY + 2} ${centerX - 5} ${mouthY + 1}`
              : `M ${centerX - 5} ${mouthY} Q ${centerX} ${mouthY + 4} ${centerX + 5} ${mouthY}`
          }
          stroke="#1e1b4b"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* left hand */}
        <motion.ellipse
          cx={pawLX}
          cy={pawY}
          rx={W * 0.16}
          ry={W * 0.13}
          fill={color}
          animate={{
            cx: eyesHidden ? centerX - pawSpread : peeking ? centerX - pawSpread : pawLX,
            cy: pawY,
            rotate: celebrating ? -30 : 0,
          }}
          style={{ originX: `${pawLX}px`, originY: `${pawRestY}px` }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        />
        {/* right hand */}
        <motion.ellipse
          cx={pawRX}
          cy={pawY}
          rx={W * 0.16}
          ry={W * 0.13}
          fill={color}
          animate={{
            cx: eyesHidden ? centerX + pawSpread : peeking ? centerX + pawSpread : pawRX,
            cy: pawY,
            rotate: celebrating ? 30 : 0,
          }}
          style={{ originX: `${pawRX}px`, originY: `${pawRestY}px` }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.03 }}
        />
      </svg>
    </motion.div>
  );
}

function ConfettiBurst({ burstId }) {
  const pieces = Array.from({ length: 20 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.3;
    const distance = 60 + Math.random() * 50;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 20,
      rotate: Math.random() * 360,
      color: ["#fbbf24", "#7c3aed", "#22d3ee", "#f472b6", "#34d399"][i % 5],
      shape: i % 2 === 0 ? "rect" : "circle",
    };
  });

  return (
    <AnimatePresence>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {pieces.map((p) => (
          <motion.span
            key={`${burstId}-${p.id}`}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
            animate={{ x: p.x, y: p.y + 40, opacity: 0, rotate: p.rotate, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute"
            style={{
              width: p.shape === "rect" ? 6 : 7,
              height: p.shape === "rect" ? 10 : 7,
              backgroundColor: p.color,
              borderRadius: p.shape === "circle" ? "9999px" : "2px",
            }}
          />
        ))}
      </div>
    </AnimatePresence>
  );
}

export default function LoginCharacters({ emailFocused, passwordFocused, showPassword, success }) {
  const [mouse, setMouse] = useState(null);
  const [burstId, setBurstId] = useState(0);

  const stage = success
    ? "celebrating"
    : passwordFocused && showPassword
    ? "peeking"
    : passwordFocused
    ? "hiding"
    : "watching";

  useEffect(() => {
    let raf = null;
    function handleMove(e) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setMouse({ x: e.clientX, y: e.clientY });
        raf = null;
      });
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    if (success) setBurstId((b) => b + 1);
  }, [success]);

  return (
    <div className="relative mb-6 flex items-end justify-center gap-3">
      {CHARACTER_SPECS.map((spec) => (
        <Character key={spec.key} spec={spec} mouse={mouse} stage={stage} />
      ))}
      {success && <ConfettiBurst burstId={burstId} />}
    </div>
  );
}
