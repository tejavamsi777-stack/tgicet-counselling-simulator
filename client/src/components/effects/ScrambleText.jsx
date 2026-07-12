import { useEffect, useState } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#________";

/**
 * Text that scrambles through random characters before resolving into
 * the real string — a glitch-reveal effect on mount.
 */
export default function ScrambleText({ text, className = "", duration = 700 }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let frame = 0;
    const totalFrames = Math.round(duration / 30);
    let intervalId;

    intervalId = setInterval(() => {
      frame += 1;
      const revealCount = Math.floor((frame / totalFrames) * text.length);

      setDisplay(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i < revealCount) return text[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (frame >= totalFrames) {
        setDisplay(text);
        clearInterval(intervalId);
      }
    }, 30);

    return () => clearInterval(intervalId);
  }, [text, duration]);

  return <span className={className}>{display}</span>;
}