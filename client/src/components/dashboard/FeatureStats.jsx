import { motion } from "framer-motion";
import { Building2, FileText, Zap, Target } from "lucide-react";

const stats = [
  {
    icon: Building2,
    value: "450+",
    label: "Colleges",
  },
  {
    icon: FileText,
    value: "40,000+",
    label: "Official Cutoffs",
  },
  {
    icon: Zap,
    value: "Instant",
    label: "Prediction",
  },
  {
    icon: Target,
    value: "2023-2025",
    label: "Official Data",
  },
];

export default function FeatureStats() {
  return (
    <section className="py-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
              }}
              whileHover={{
                y: -6,
                scale: 1.02,
              }}
              className="rounded-[28px] border border-white/50 bg-white/70 p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(37,99,235,0.10)] transition-all"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                <Icon className="h-7 w-7 text-blue-600" />
              </div>

              <h3 className="text-3xl font-bold text-slate-900">
                {item.value}
              </h3>

              <p className="mt-2 text-slate-500">
                {item.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}