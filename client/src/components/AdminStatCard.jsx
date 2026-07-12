import { motion } from "framer-motion";
import Card from "../../components/ui/Card";
import { useCountUp } from "../../hooks/useCountUp";
import { cn } from "../../utils/cn";

const accentMap = {
  brand: "text-brand-600 bg-brand-50 dark:bg-brand-500/10",
  emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
  amber: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
  purple: "text-purple-600 bg-purple-50 dark:bg-purple-500/10",
};

export default function AdminStatCard({ label, value, icon: Icon, accent = "brand", delay = 0 }) {
  const count = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <Card className="p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {count.toLocaleString()}
            </p>
          </div>
          {Icon && (
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accentMap[accent])}>
              <Icon size={20} />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}