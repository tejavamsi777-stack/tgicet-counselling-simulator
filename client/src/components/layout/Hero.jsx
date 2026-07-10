import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import Button from "../ui/Button";

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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-brand-100),_transparent_60%)]"
      />

      <div className="absolute -top-40 -left-20 h-96 w-96 rounded-full bg-blue-300/20 blur-[120px]" />
<div className="absolute top-20 right-0 h-[450px] w-[450px] rounded-full bg-indigo-300/20 blur-[120px]" />

      <motion.h1
        style={{ scale: titleScale, y: titleY }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="mx-auto max-w-5xl px-4 origin-top text-5xl font-bold tracking-tight text-slate-900 sm:text-4xl sm:text-5xl lg:text-7xl"
      >
        Find your college.{" "}
  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
    Instantly.
  </span>
</motion.h1>
      

      <motion.div
        style={{ height: collapseHeight, opacity: collapseOpacity }}
        className="flex w-full items-start justify-center overflow-hidden"
      >
        <div className="pt-4">
          <Button size="lg" onClick={onGetStarted}>
            Predict My College
            <ArrowDown size={16} />
          </Button>
        </div>
      </motion.div>
    </section>
  );
}