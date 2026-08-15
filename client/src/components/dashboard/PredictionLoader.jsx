import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { WaveLoader } from "../ui/wave-loader";

const DURATION = 3000;

export default function PredictionLoader({ onComplete, examSlug = "tg-icet" }) {
  const [mounted, setMounted] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setMounted(true);
    // Lock body scrolling while loader is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      onCompleteRef.current?.();
    }, DURATION);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[999999] flex h-[100dvh] w-[100vw] flex-col items-center justify-center overflow-hidden bg-black/95 backdrop-blur-2xl"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100dvh",
      }}
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center p-8 text-center"
      >
        <WaveLoader
          bars={5}
          barClassName="w-2.5 h-8 bg-white"
          message="Finding matching colleges for your rank…"
        />
      </motion.div>
    </motion.div>
  );

  return createPortal(content, document.body);
}