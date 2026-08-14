import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Building2, Users, GraduationCap, CheckCircle2 } from "lucide-react";
import collegeTypes from "../../data/collegeTypes.json";
import { getDistrictName } from "../../utils/districtNames";

function ValuePill({ value }) {
  const v = (value || "NA").trim();
  const positive = /^(yes|govt|government|co-?ed|univ)/i.test(v);
  const negative = /^(no|private|men|women|girls)/i.test(v);
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

function renderFeeOrStatus(fee) {
  if (fee !== null && fee !== undefined && !isNaN(Number(fee)) && Number(fee) > 0) {
    return (
      <span className="font-bold text-slate-900">
        ₹{Number(fee).toLocaleString("en-IN")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
      <CheckCircle2 size={12} /> Available
    </span>
  );
}

export default function CollegeInfoModal({ college, onClose }) {
  if (!college) return null;

  const info = collegeTypes[college.code];
  const raw = info?.raw || "";

  const type = raw.match(/Type:\s*([^,]+)/)?.[1] || "NA";
  const minority = raw.match(/Minority:\s*([^,]+)/)?.[1] || "NA";
  const coEd = raw.match(/Co-Ed:\s*([^,]+)/)?.[1] || "NA";

  const districtDisplay = college.districtName || getDistrictName(college.district);

  const typeDisplay =
    type !== "NA"
      ? type
      : college.ownership_type === "UNIV"
      ? "UNIV"
      : college.is_self_finance
      ? "SF"
      : college.ownership_type || "PVT";

  const minorityDisplay =
    minority !== "NA"
      ? minority
      : college.is_minority
      ? "MINORITY"
      : "NON-MINORITY";

  const coEdDisplay =
    coEd !== "NA"
      ? coEd
      : college.is_girls
      ? "GIRLS"
      : "COED";

  // Derive offered courses list from college.courseFees or college.courses array
  const offeredCourses = useMemo(() => {
    if (college.courseFees && college.courseFees.length > 0) {
      return college.courseFees;
    }
    if (college.courses && college.courses.length > 0) {
      return college.courses.map((c) =>
        typeof c === "string" ? { code: c, fee: null } : c
      );
    }
    return [];
  }, [college]);

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
          className="w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-2xl shadow-indigo-900/20 backdrop-blur-xl"
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

          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="max-h-[55vh] space-y-2 overflow-y-scroll overscroll-contain px-6 py-5"
            style={{
              touchAction: "pan-y",
              scrollbarWidth: "thin",
              scrollbarColor: "#6366f1 #f1f5f9",
            }}
          >
            <InfoRow icon={MapPin} label="District">
              <span className="text-sm font-bold text-slate-800">
                {districtDisplay}
              </span>
            </InfoRow>

            <InfoRow icon={Building2} label="Type of College">
              <ValuePill value={typeDisplay} />
            </InfoRow>

            <InfoRow icon={Users} label="Minority">
              <ValuePill value={minorityDisplay} />
            </InfoRow>

            <InfoRow icon={GraduationCap} label="Co-Education">
              <ValuePill value={coEdDisplay} />
            </InfoRow>

            <section className="rounded-xl bg-white/60 px-3.5 py-3 border border-slate-200/60">
              <div className="mb-2.5 flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>Offered Courses & Status</span>
                <span className="text-xs font-normal text-slate-500">
                  {offeredCourses.length} course{offeredCourses.length === 1 ? "" : "s"}
                </span>
              </div>
              {offeredCourses.length > 0 ? (
                <div className="space-y-1.5">
                  {offeredCourses.map((course) => (
                    <div
                      key={course.code}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm shadow-sm"
                    >
                      <span className="font-bold text-slate-800">{course.code}</span>
                      {renderFeeOrStatus(course.fee)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No course data available.</p>
              )}
            </section>
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
