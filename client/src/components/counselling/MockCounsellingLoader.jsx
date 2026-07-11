import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const MESSAGES = [
  "Loading college directory…",
  "Preparing district data…",
  "Setting up your session…",
];

export default function MockCounsellingLoader({ onComplete }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, 650);
    const doneTimer = setTimeout(() => {
      clearInterval(messageTimer);
      onComplete();
    }, 2000);
    return () => {
      clearInterval(messageTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="relative h-24 w-24">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#312e81] via-[#7c3aed] to-[#0e7490] blur-xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-transparent"
          style={{ borderTopColor: "#7c3aed", borderRightColor: "#22d3ee" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <h2
        className="mt-8 text-2xl font-bold tracking-tight text-slate-900"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Starting Mock Counselling
      </h2>

      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-sm text-slate-500"
      >
        {MESSAGES[messageIndex]}
      </motion.p>

      <div className="mt-6 h-1 w-56 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="h-full bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}