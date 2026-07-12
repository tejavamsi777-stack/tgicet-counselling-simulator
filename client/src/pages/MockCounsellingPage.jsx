import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { api } from "../lib/api";
import { getFinalOptionList } from "../utils/sortByPreference";
import { saveOptions, loadOptions } from "../utils/mockCounsellingStorage";
import { exportPreferencesToPDF } from "../utils/exportPreferences";
import { getDuplicatePreferenceNumbers } from "../utils/preferenceValidation";

import CandidateDetailsForm from "../components/counselling/CandidateDetailsForm";
import PreferenceForm from "../components/counselling/PreferenceForm";
import DistrictSelector from "../components/counselling/DistrictSelector";
import PreferenceList from "../components/counselling/PreferenceList";
import EmberField from "../components/effects/EmberField";
import ScrambleText from "../components/effects/ScrambleText";
import MagneticButton from "../components/effects/MagneticButton";

const stepVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

export default function MockCounsellingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [candidateError, setCandidateError] = useState("");

  const [course, setCourse] = useState("MBA");
  const [districtError, setDistrictError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [step, setStep] = useState("candidate"); // "candidate" | "details" | "list"
  const [submitted, setSubmitted] = useState(null);
  const [preferences, setPreferences] = useState({});

 const [showInsertPanel, setShowInsertPanel] = useState(false);
  const [insertCollege, setInsertCollege] = useState("");
  const [insertPosition, setInsertPosition] = useState("");

  const saveShake = useAnimation();
  const printShake = useAnimation();
  const hasDuplicates = getDuplicatePreferenceNumbers(preferences).length > 0;

  function shake(controls) {
    controls.start({
      x: [0, -8, 8, -8, 8, -4, 4, 0],
      transition: { duration: 0.4 },
    });
  }

  const [courseColleges, setCourseColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [collegesError, setCollegesError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchColleges() {
      setCollegesLoading(true);
      setCollegesError("");
      try {
        const colleges = await api.get(`/colleges?course=${encodeURIComponent(course)}`);
        if (!cancelled) {
          const mapped = colleges.map((c) => ({
            ...c,
            district: c.district_code,
          }));
          setCourseColleges(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          setCollegesError(err.message || "Failed to load colleges for this course.");
          setCourseColleges([]);
        }
      } finally {
        if (!cancelled) setCollegesLoading(false);
      }
    }

    fetchColleges();
    return () => {
      cancelled = true;
    };
  }, [course]);

  const availableDistricts = useMemo(() => {
    return [...new Set(courseColleges.map((c) => c.district))].sort();
  }, [courseColleges]);

  useEffect(() => {
    setSelectedDistricts((prev) => prev.filter((d) => availableDistricts.includes(d)));
  }, [availableDistricts]);

  function handleBack() {
    if (step === "list") {
      setStep("details");
    } else if (step === "details") {
      setStep("candidate");
    } else {
      navigate("/");
    }
  }

  function handleCandidateSubmit() {
    if (rank.toString().trim() === "") {
      setCandidateError("Please enter your TG ICET Rank");
      return;
    }
    if (category === "") {
      setCandidateError("Please select your category");
      return;
    }
    if (gender === "") {
      setCandidateError("Please select your gender");
      return;
    }
    setCandidateError("");
    setStep("details");
  }

  function handleSubmit() {
    if (selectedDistricts.length === 0) {
      setDistrictError("Please select at least one district");
      return;
    }
    setDistrictError("");
    setSubmitted({ course, selectedDistricts, rank, category, gender });
    setPreferences({});
    setStatusMessage("");
    setStep("list");
  }

  const availableColleges = useMemo(() => {
    if (!submitted) return [];
    return courseColleges
      .filter((c) => submitted.selectedDistricts.includes(c.district))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [submitted, courseColleges]);

  function handleSaveOptions() {
    if (!submitted) return;
    const dupes = getDuplicatePreferenceNumbers(preferences);
    if (dupes.length > 0) {
      setStatusMessage(`Fix duplicate preference number(s) before saving: ${dupes.join(", ")}`);
      shake(saveShake);
      return;
    }
    saveOptions(submitted, preferences);
    setStatusMessage("Options saved to this browser.");
  }

  function handleLoadLastSaved() {
    const saved = loadOptions();
    if (!saved) {
      setStatusMessage("No saved options found on this device.");
      return;
    }

    const normalizedCriteria = {
      rank: saved.criteria.rank ?? "",
      category: saved.criteria.category ?? "OC",
      gender: saved.criteria.gender ?? "Male",
      course: saved.criteria.course,
      selectedDistricts: saved.criteria.selectedDistricts ?? [],
    };

    setRank(normalizedCriteria.rank);
    setCategory(normalizedCriteria.category);
    setGender(normalizedCriteria.gender);
    setCourse(normalizedCriteria.course);
    setSelectedDistricts(normalizedCriteria.selectedDistricts);
    setSubmitted(normalizedCriteria);
    setPreferences(saved.preferences);
    setStep("list");
    setStatusMessage(`Loaded options saved on ${new Date(saved.savedAt).toLocaleString()}.`);
  }

  function handleViewAndPrint() {
    const dupes = getDuplicatePreferenceNumbers(preferences);
    if (dupes.length > 0) {
      setStatusMessage(`Fix duplicate preference number(s) before printing: ${dupes.join(", ")}`);
      shake(printShake);
      return;
    }
    const finalList = getFinalOptionList(availableColleges, preferences);
    if (finalList.length === 0) {
      setStatusMessage("Assign at least one preference number before printing.");
      return;
    }
    exportPreferencesToPDF(finalList, submitted);
  }

  function handleInsertBetween() {
    if (!insertCollege || insertPosition === "") {
      setStatusMessage("Pick a college and a position to insert at.");
      return;
    }
    const pos = Number(insertPosition);
    setPreferences((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((code) => {
        if (updated[code] !== "" && Number(updated[code]) >= pos) {
          updated[code] = Number(updated[code]) + 1;
        }
      });
      updated[insertCollege] = pos;
      return updated;
    });
    setStatusMessage(`Inserted ${insertCollege} at position ${pos}, shifted the rest down.`);
    setInsertCollege("");
    setInsertPosition("");
    setShowInsertPanel(false);
  }

  function handleHeroMouseMove(e) {
    const rect = heroRef.current.getBoundingClientRect();
    setSpotlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  let stepContent = null;

  if (step === "candidate") {
    stepContent = (
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/50 bg-white/70 p-8 shadow-[0_20px_60px_rgba(37,99,235,0.12)] backdrop-blur-2xl">
          <CandidateDetailsForm
            rank={rank}
            setRank={setRank}
            category={category}
            setCategory={setCategory}
            gender={gender}
            setGender={setGender}
            error={candidateError}
          />
        </div>
        <div className="text-center">
          <MagneticButton
            onClick={handleCandidateSubmit}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-md"
          >
            Continue
          </MagneticButton>
        </div>
      </div>
    );
  } else if (step === "details") {
    stepContent = (
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/50 bg-white/70 p-8 shadow-[0_20px_60px_rgba(37,99,235,0.12)] backdrop-blur-2xl">
          <PreferenceForm course={course} setCourse={setCourse} />
        </div>
        {collegesLoading ? (
          <div className="rounded-[32px] border border-white/50 bg-white/70 p-8 text-center text-slate-500 backdrop-blur-2xl">
            Loading districts for this course...
          </div>
        ) : (
          <div className="rounded-[32px] border border-white/50 bg-white/70 p-8 shadow-[0_20px_60px_rgba(37,99,235,0.12)] backdrop-blur-2xl">
            <DistrictSelector
              districts={availableDistricts}
              selectedDistricts={selectedDistricts}
              setSelectedDistricts={setSelectedDistricts}
              error={districtError}
            />
          </div>
        )}
        <div className="text-center">
          <MagneticButton
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-md"
          >
            Display Option Entry Form
          </MagneticButton>
        </div>
      </div>
    );
  } else if (step === "list") {
    stepContent = (
      <div className="space-y-6">
        <div className="sticky top-20 z-30 flex flex-wrap items-center gap-3 rounded-2xl border border-white/50 bg-white/80 p-3 shadow-lg backdrop-blur-2xl">
          <button
            onClick={() => setStep("details")}
            className="rounded border border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Back to Districts
          </button>
          <button
            onClick={handleLoadLastSaved}
            className="rounded border border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Last Saved Options
          </button>
          <button
            onClick={() => setShowInsertPanel((v) => !v)}
            className="rounded border border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Enter Between Options
          </button>
          <motion.button
            animate={saveShake}
            onClick={handleSaveOptions}
            className={`rounded border px-4 py-2 text-sm font-medium ${
              hasDuplicates
                ? "border-rose-300 bg-rose-50 text-rose-400 cursor-not-allowed"
                : "border-slate-400 bg-white text-slate-800 hover:bg-slate-50"
            }`}
          >
            Save Options
          </motion.button>
          <motion.button
            animate={printShake}
            onClick={handleViewAndPrint}
            className={`rounded border px-4 py-2 text-sm font-medium ${
              hasDuplicates
                ? "border-rose-300 bg-rose-50 text-rose-400 cursor-not-allowed"
                : "border-slate-400 bg-white text-slate-800 hover:bg-slate-50"
            }`}
          >
            View &amp; Print
          </motion.button>
          {statusMessage && <span className="text-sm text-slate-600">{statusMessage}</span>}
        </div>

        {showInsertPanel && (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-300 bg-white p-3">
            <label className="text-sm font-medium text-slate-700">Insert college</label>
            <select
              value={insertCollege}
              onChange={(e) => setInsertCollege(e.target.value)}
              className="rounded border border-slate-400 px-3 py-1.5 text-sm"
            >
              <option value="">Select college</option>
              {availableColleges.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
            <label className="text-sm font-medium text-slate-700">at position</label>
            <input
              type="number"
              min="1"
              value={insertPosition}
              onChange={(e) => setInsertPosition(e.target.value)}
              className="w-20 rounded border border-slate-400 px-2 py-1.5 text-sm"
            />
            <button
              onClick={handleInsertBetween}
              className="rounded bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Insert
            </button>
          </div>
        )}

        {submitted && (
          <div className="flex flex-wrap gap-x-8 gap-y-1 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm">
            <span>
              <span className="font-semibold text-slate-700">Rank:</span> {submitted.rank}
            </span>
            <span>
              <span className="font-semibold text-slate-700">Category:</span> {submitted.category}
            </span>
            <span>
              <span className="font-semibold text-slate-700">Gender:</span> {submitted.gender}
            </span>
            <span>
              <span className="font-semibold text-slate-700">Course:</span> {submitted.course}
            </span>
          </div>
        )}

        <PreferenceList
          colleges={availableColleges}
          course={submitted?.course}
          preferences={preferences}
          setPreferences={setPreferences}
        />
      </div>
    );
  }

  return (
    <main className="relative mx-auto max-w-6xl space-y-8 overflow-hidden px-6 pb-12 pt-6">
      <button
        onClick={handleBack}
        className="relative z-10 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="relative overflow-hidden rounded-[40px] py-16 text-center"
      >
        {/* Rising ember particle field */}
        <EmberField density={60} />

        {/* Mouse-reactive spotlight glow */}
        <div
          className="pointer-events-none absolute inset-0 transition-[background] duration-150"
          style={{
            background: `radial-gradient(500px circle at ${spotlight.x}% ${spotlight.y}%, rgba(124,58,237,0.18), transparent 70%)`,
          }}
        />

        {/* Base ambient gradient wash so the hero isn't pure white behind the embers */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-50 via-white to-cyan-50/40" />

        <div className="relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-3 inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-violet-200 bg-violet-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700 shadow-[0_0_20px_rgba(124,58,237,0.25)]"
          >
            <motion.span
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 0px rgba(124,58,237,0.0)",
                  "0 0 16px rgba(124,58,237,0.5)",
                  "0 0 0px rgba(124,58,237,0.0)",
                ],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <Sparkles size={12} />
            </motion.span>
            <span className="relative">Practice Web Options</span>
          </motion.span>

          <h1
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490] bg-clip-text text-transparent">
              <ScrambleText text="Mock Counselling" duration={800} />
            </span>{" "}
            <span className="text-slate-900">Simulator</span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-2 text-base text-slate-500"
          >
            Select your district(s), then build your preference list.
          </motion.p>
        </div>
      </div>

      {collegesError && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {collegesError}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {stepContent}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}