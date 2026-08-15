import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { GlassButton } from "../ui/glass-button";

export default function Hero({
  title = "Find your college. Instantly.",
  subtitle,
  onGetStarted,
}) {
  return (
    <section className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pt-8 pb-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-4 max-w-2xl text-sm font-medium text-gray-300 sm:text-base"
        >
          {subtitle}
        </motion.p>
      )}

      {onGetStarted && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex justify-center"
        >
          <GlassButton
            onClick={onGetStarted}
            size="default"
            contentClassName="flex items-center justify-center gap-2"
          >
            <span>Predict My College</span>
            <ArrowDown size={16} />
          </GlassButton>
        </motion.div>
      )}
    </section>
  );
}