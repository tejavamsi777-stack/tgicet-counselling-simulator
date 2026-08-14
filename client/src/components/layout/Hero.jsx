import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { GlassButton } from "../ui/glass-button";

export default function Hero({ onGetStarted }) {
  const ref = useRef(null);
  const { scrollY } = useScroll();

  const titleScale = useTransform(scrollY, [0, 250], [1, 0.55]);
  const titleY = useTransform(scrollY, [0, 250], [0, -20]);

  const collapseHeight = useTransform(scrollY, [0, 90], [84, 0]);
  const collapseOpacity = useTransform(scrollY, [0, 90], [1, 0]);

  return (
    <section
      ref={ref}
      className="sticky top-16 z-10 flex flex-col items-center overflow-hidden px-6 pt-10 text-center will-change-transform"
    >
      <motion.h1
        style={{ scale: titleScale, y: titleY }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="mx-auto max-w-5xl px-4 origin-top text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Find your college. Instantly.
      </motion.h1>

      <motion.div
        style={{ height: collapseHeight, opacity: collapseOpacity }}
        className="flex w-full items-start justify-center overflow-hidden"
      >
        <div className="pt-4">
          <GlassButton
            onClick={onGetStarted}
            size="lg"
            contentClassName="flex items-center justify-center gap-2"
          >
            <span>Predict My College</span>
            <ArrowDown size={18} />
          </GlassButton>
        </div>
      </motion.div>
    </section>
  );
}