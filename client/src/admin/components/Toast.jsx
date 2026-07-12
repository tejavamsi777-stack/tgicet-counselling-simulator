import { motion } from "framer-motion";
import { CheckCircle2, XCircle, X } from "lucide-react";

const STYLES = {
  success: {
    icon: CheckCircle2,
    className: "bg-emerald-600 text-white",
  },
  error: {
    icon: XCircle,
    className: "bg-red-600 text-white",
  },
};

export default function Toast({ message, type = "success", onClose }) {
  const { icon: Icon, className } = STYLES[type] ?? STYLES.success;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${className}`}
    >
      <Icon size={16} />
      <span className="max-w-xs">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100">
        <X size={14} />
      </button>
    </motion.div>
  );
}