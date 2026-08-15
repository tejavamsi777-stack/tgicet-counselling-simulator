import { motion } from "framer-motion";
import { Building2, FileText, Zap, Target } from "lucide-react";
import { GlowCard } from "../ui/spotlight-card";

const stats = [
  {
    icon: Building2,
    value: "Real-Time Data",
    label: "Latest Cutoffs",
  },
  {
    icon: FileText,
    value: "Free Export",
    label: "PDF & Excel",
  },
  {
    icon: Zap,
    value: "Instant",
    label: "Prediction",
  },
  {
    icon: Target,
    value: "450+",
    label: "Colleges",
  },
];

export default function FeatureStats() {
  return (
    <section className="hidden sm:block py-6">
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
              className="relative"
            >
              <GlowCard customSize={true} glowColor="purple" className="p-6 sm:p-7">
                <div className="glass-button-wrap relative mb-4 inline-flex">
                  <div className="glass-button flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-gradient-to-br from-white/20 via-white/10 to-white/5 text-purple-300 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
                    <Icon className="h-6 w-6 text-purple-300" />
                  </div>
                  <div className="glass-button-shadow rounded-2xl"></div>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {item.value}
                </h3>

                <p className="mt-1 text-xs font-medium text-gray-300">
                  {item.label}
                </p>
              </GlowCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}