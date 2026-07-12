import { motion } from "framer-motion";
import { useCountUp } from "../../hooks/useCountUp";
import Card from "../../components/ui/Card";

const ACCENTS = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
};

export default function AdminStatCard({ label, value, icon: Icon, accent = "brand", delay = 0 }) {
  const animatedValue = useCountUp(value, 900);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="flex items-center gap-4 p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ACCENTS[accent] ?? ACCENTS.brand}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {animatedValue.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </Card>
    </motion.div>
  );
}