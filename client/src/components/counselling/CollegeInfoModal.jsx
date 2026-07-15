import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Building2, Users, GraduationCap } from "lucide-react";
import collegeTypes from "../../data/collegeTypes.json";

function ValuePill({ value }) {
  const v = (value || "NA").trim();
  const positive = /^(yes|govt|government|co-?ed)/i.test(v);
  const negative = /^(no|private|men|women)/i.test(v);
  const neutral = v === "NA";

  const styles = neutral
    ? "bg-slate-100 text-slate-500 border-slate-200"
    : positive
    ? "bg-teal-50 text-teal-700 border-teal-200"
    : negative
    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
    : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {v}
    </span>
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/50 px-3.5 py-2.5">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <Icon size={16} className="text-slate-400" strokeWidth={2.2} />
        {label}
      </span>
      {children}
    </div>
  );
}

export default function CollegeInfoModal({ college, onClose }) {
  if (!college) return null;

  const info = collegeTypes[college.code];
  const raw = info?.raw || "";

  const type = raw.match(/Type:\s*([^,]+)/)?.[1] || "NA";
  const minority = raw.match(/Minority:\s*([^,]+)/)?.[1] || "NA";
  const coEd = raw.match(/Co-Ed:\s*([^,]+)/)?.[1] || "NA";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl shadow-indigo-900/20 backdrop-blur-xl"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative px-6 pb-5 pt-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(109,93,246,0.12), rgba(79,142,247,0.12), rgba(34,193,166,0.12))",
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full bg-white/70 p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-800"
            >
              <X size={16} strokeWidth={2.4} />
            </button>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              College Details
            </p>
            <h3 className="mt-1 text-lg font-bold leading-snug text-slate-900">
              {college.name}
            </h3>
            <span className="mt-1 inline-block rounded-md bg-slate-900/5 px-2 py-0.5 text-xs font-medium text-slate-500">
              {college.code}
            </span>
          </div>

          <div className="space-y-2 px-6 py-5">
            <InfoRow icon={MapPin} label="District">
              <span className="text-sm font-semibold text-slate-800">
                {college.district}
              </span>
            </InfoRow>

            <InfoRow icon={Building2} label="Type of College">
              <ValuePill value={type} />
            </InfoRow>

            <InfoRow icon={Users} label="Minority">
              <ValuePill value={minority} />
            </InfoRow>

            <InfoRow icon={GraduationCap} label="Co-Education">
              <ValuePill value={coEd} />
            </InfoRow>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.98]"
              style={{
                background: "linear-gradient(90deg, #6D5DF6 0%, #4F8EF7 55%, #22C1A6 100%)",
              }}
            >
              Got it
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}