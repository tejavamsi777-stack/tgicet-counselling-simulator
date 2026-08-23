import { motion } from "framer-motion";

export function ThreeDotsLoader({ className = "", dotClassName = "bg-purple-400", label }) {
  return (
    <div className={`inline-flex items-center gap-2 text-xs font-medium text-white/60 ${className}`}>
      {label && <span>{label}</span>}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className={`h-1.5 w-1.5 rounded-full ${dotClassName}`}
            animate={{
              scale: [0.6, 1.2, 0.6],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default ThreeDotsLoader;
