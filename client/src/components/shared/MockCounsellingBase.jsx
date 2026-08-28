import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { api } from "../../lib/api";
import { getFinalOptionList } from "../../utils/sortByPreference";
import { saveOptions, loadOptions, saveActiveSession, loadActiveSession } from "../../utils/mockCounsellingStorage";
import { exportPreferencesToPDF } from "../../utils/exportPreferences";
import { getDuplicatePreferenceNumbers } from "../../utils/preferenceValidation";

import CandidateDetailsForm from "../counselling/CandidateDetailsForm";
import DistrictSelector from "../counselling/DistrictSelector";
import PreferenceList from "../counselling/PreferenceList";
import EmberField from "../effects/EmberField";
import ScrambleText from "../effects/ScrambleText";
import MagneticButton from "../effects/MagneticButton";

const stepVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

function isBrowserRefresh() {
  const navigation = performance.getEntriesByType("navigation")[0];
  return navigation?.type === "reload";
}

/**
 * MockCounsellingBase — shared engine used by both IcetMockCounsellingPage
 * and EapcetMockCounsellingPage. Pass exam-specific config via props.
 *
 * Props:
 *   examSlug        — e.g. "tg-icet" | "tg-eapcet"
 *   storageNamespace — e.g. "tgicet" | "tgeapcet"
 *   rankLabel       — label shown in the rank input
 *   heroTitle       — main heading text (ScrambleText)
 *   heroSubtitle    — paragraph below the heading
 *   badgeText       — small badge above the heading
 */
export default function MockCounsellingBase({
  examSlug = "tg-icet",
  storageNamespace = "tgicet",
  rankLabel = "Rank",
  heroTitle = "Mock Counselling",
  heroSubtitle = "Select your district(s), then build your preference list.",
  badgeText = "Practice Web Options",
}) {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const [restoredSession] = useState(() =>
    isBrowserRefresh() ? loadActiveSession(storageNamespace) : null
  );

  const [rank, setRank] = useState(() => restoredSession?.criteria?.rank ?? "");
  const [category, setCategory] = useState(() => restoredSession?.criteria?.category ?? "");
  const [gender, setGender] = useState(() => restoredSession?.criteria?.gender ?? "");
  const [candidateError, setCandidateError] = useState("");

  const [districtError, setDistrictError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info");

  const [selectedDistricts, setSelectedDistricts] = useState(
    () => restoredSession?.criteria?.selectedDistricts ?? []
  );

  const [step, setStep] = useState(() => {
    if (restoredSession?.step) return restoredSession.step;
    if (restoredSession?.criteria) return "list";
    return "candidate";
  });
  const [submitted, setSubmitted] = useState(() => restoredSession?.criteria ?? null);
  const [preferences, setPreferences] = useState(() => restoredSession?.preferences ?? {});

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

  const [allColleges, setAllColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [collegesError, setCollegesError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchColleges() {
      setCollegesLoading(true);
      setCollegesError("");
      try {
        const colleges = await api.get(`/colleges?exam=${examSlug}`);
        if (!cancelled) {
          const mapped = colleges.map((c) => ({
            ...c,
            district: c.district_code,
            districtName: c.district_name,
          }));
          setAllColleges(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          setCollegesError(err.message || "Failed to load colleges.");
          setAllColleges([]);
        }
      } finally {
        if (!cancelled) setCollegesLoading(false);
      }
    }
    fetchColleges();
    return () => { cancelled = true; };
  }, [examSlug]);

  const availableDistricts = useMemo(
    () => [...new Set(allColleges.map((c) => c.district))].sort(),
    [allColleges]
  );

  const courseGroups = useMemo(() => {
    const branchMap = new Map();
    allColleges.forEach((college) =>
      (college.courseFees || []).forEach((course) =>
        branchMap.set(course.code, { code: course.code, name: course.name || course.code })
      )
    );
    const branches = [...branchMap.values()];
    if (branches.length === 0) return undefined;
    return branches.map((branch) => ({
      group: `${branch.code} — ${branch.name}`,
      branches: [branch],
    }));
  }, [allColleges]);

  useEffect(() => {
    if (availableDistricts.length > 0) {
      setSelectedDistricts((prev) => {
        const filtered = prev.filter((d) => availableDistricts.includes(d));
        return filtered.length === prev.length ? prev : filtered;
      });
    }
  }, [availableDistricts]);

  function handleBack() {
    if (step === "list") setStep("details");
    else if (step === "details") setStep("candidate");
    else navigate("/");
  }

  function handleCandidateSubmit() {
    if (rank.toString().trim() === "") {
      setCandidateError(`Please enter your ${rankLabel}`);
      return;
    }
    if (category === "") { setCandidateError("Please select your category"); return; }
    if (gender === "") { setCandidateError("Please select your gender"); return; }
    setCandidateError("");
    setStep("details");
  }

  function handleSubmit() {
    if (selectedDistricts.length === 0) {
      setDistrictError("Please select at least one district");
      return;
    }
    setDistrictError("");
    setSubmitted({ selectedDistricts, rank, category, gender });
    setPreferences({});
    setStatusMessage("");
    setStep("list");
  }

  const availableColleges = useMemo(() => {
    if (!submitted) return [];
    return allColleges
      .filter((c) => submitted.selectedDistricts.includes(c.district))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [submitted, allColleges]);

  useEffect(() => {
    const currentCriteria = submitted || { rank, category, gender, selectedDistricts };
    saveActiveSession(currentCriteria, preferences, step, storageNamespace);
  }, [step, submitted, rank, category, gender, selectedDistricts, preferences, storageNamespace]);

  function handleSaveOptions() {
    if (!submitted) return;
    const dupes = getDuplicatePreferenceNumbers(preferences);
    if (dupes.length > 0) {
      setStatusMessage(`Fix duplicate preference number(s) before saving: ${dupes.join(", ")}`);
      setStatusType("error");
      shake(saveShake);
      return;
    }
    saveOptions(submitted, preferences, storageNamespace);
    setStatusMessage("Options saved to this browser.");
    setStatusType("success");
  }

  function handleLoadLastSaved() {
    const saved = loadOptions(storageNamespace);
    if (!saved) { setStatusMessage("No saved options found on this device."); return; }
    const normalizedCriteria = {
      rank: saved.criteria.rank ?? "",
      category: saved.criteria.category ?? "OC",
      gender: saved.criteria.gender ?? "Male",
      selectedDistricts: saved.criteria.selectedDistricts ?? [],
    };
    setRank(normalizedCriteria.rank);
    setCategory(normalizedCriteria.category);
    setGender(normalizedCriteria.gender);
    setSelectedDistricts(normalizedCriteria.selectedDistricts);
    setSubmitted(normalizedCriteria);
    setPreferences(saved.preferences);
    setStep("list");
    setStatusMessage(`Loaded options saved on ${new Date(saved.savedAt).toLocaleString()}.`);
  }

  function performPrint() {
    const dupes = getDuplicatePreferenceNumbers(preferences);
    if (dupes.length > 0) {
      setStatusMessage(`Fix duplicate preference number(s) before printing: ${dupes.join(", ")}`);
      setStatusType("error");
      shake(printShake);
      return;
    }
    const finalList = getFinalOptionList(availableColleges, preferences);
    if (finalList.length === 0) {
      setStatusMessage("Assign at least one preference number before printing.");
      setStatusType("error");
      return;
    }
    exportPreferencesToPDF(finalList, submitted);
    setStatusMessage("PDF downloaded successfully.");
    setStatusType("success");
  }

  function handleViewAndPrint() {
    performPrint();
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

  // ── Step content ──────────────────────────────────────────────────────────

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
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#3B82F6] via-[#4F46E5] to-[#7C3AED] px-8 py-3 text-sm font-semibold text-white shadow-md hover:from-[#2563EB] hover:via-[#4338CA] hover:to-[#6D28D9]"
          >
            Continue
          </MagneticButton>
        </div>
      </div>
    );
  } else if (step === "details") {
    stepContent = (
      <div className="space-y-6 overflow-visible">
        {collegesLoading ? (
          <div className="rounded-3xl border border-white/50 bg-white/70 p-8 text-center text-slate-500 backdrop-blur-2xl">
            Loading districts...
          </div>
        ) : (
          <div className="rounded-2xl sm:rounded-3xl border border-white/50 bg-white/70 p-1 sm:p-6 shadow-[0_20px_60px_rgba(37,99,235,0.12)] backdrop-blur-2xl overflow-x-auto">
            <DistrictSelector
              districts={availableDistricts}
              selectedDistricts={selectedDistricts}
              setSelectedDistricts={setSelectedDistricts}
              error={districtError}
              courseGroups={courseGroups}
            />
          </div>
        )}
        <div className="text-center">
          <MagneticButton
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#3B82F6] via-[#4F46E5] to-[#7C3AED] px-8 py-3 text-sm font-semibold text-white shadow-md hover:from-[#2563EB] hover:via-[#4338CA] hover:to-[#6D28D9]"
          >
            Display Option Entry Form
          </MagneticButton>
        </div>
      </div>
    );
  } else if (step === "list") {
    stepContent = (
      <div className="space-y-1.5" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div className="sticky top-0 z-30 flex flex-wrap items-center justify-center gap-2 border border-[#52647b] bg-[#c7c7c7] px-3 py-1">
          <button
            onClick={() => setStep("details")}
            className="border border-[#777] bg-[#f5f5f5] px-3 py-1 text-[14px] font-normal text-black hover:bg-white"
          >
            Back to Districts
          </button>
          <button
            onClick={handleLoadLastSaved}
            className="border border-[#777] bg-[#f5f5f5] px-3 py-1 text-[14px] font-normal text-black hover:bg-white"
          >
            Last Saved Options
          </button>
          <button
            onClick={() => setShowInsertPanel((v) => !v)}
            className="border border-[#777] bg-[#f5f5f5] px-3 py-1 text-[14px] font-normal text-black hover:bg-white"
          >
            Enter Between Options
          </button>
          <motion.button
            animate={saveShake}
            onClick={handleSaveOptions}
            className={`border px-3 py-1 text-[14px] font-normal ${
              hasDuplicates
                ? "cursor-not-allowed border-rose-300 bg-rose-50 text-rose-400"
                : "border-[#777] bg-[#f5f5f5] text-black hover:bg-white"
            }`}
          >
            Save Options
          </motion.button>
          <motion.button
            animate={printShake}
            onClick={handleViewAndPrint}
            className={`border px-3 py-1 text-[14px] font-normal ${
              hasDuplicates
                ? "cursor-not-allowed border-rose-300 bg-rose-50 text-rose-400"
                : "border-[#777] bg-[#f5f5f5] text-black hover:bg-white"
            }`}
          >
            View &amp; Print
          </motion.button>
          {statusMessage && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-normal ${
                statusType === "error"
                  ? "text-red-600"
                  : statusType === "success"
                  ? "text-green-600"
                  : "text-slate-600"
              }`}
            >
              {statusType === "success" && <ThumbsUp size={14} />}
              {statusType === "error" && <ThumbsDown size={14} />}
              {statusMessage}
            </span>
          )}
        </div>

        {showInsertPanel && (
          <div className="flex flex-wrap items-center gap-2 border border-[#777] bg-white p-2 text-sm">
            <label className="text-sm font-normal text-black">Insert college</label>
            <select
              value={insertCollege}
              onChange={(e) => setInsertCollege(e.target.value)}
              className="border border-[#777] px-2 py-1 text-sm"
            >
              <option value="">Select college</option>
              {availableColleges.flatMap((c) =>
                (c.courses || []).map((course) => (
                  <option key={`${c.code}_${course}`} value={`${c.code}_${course}`}>
                    {c.code} ({course}) — {c.name}
                  </option>
                ))
              )}
            </select>
            <label className="text-sm font-normal text-black">at position</label>
            <input
              type="number"
              min="1"
              value={insertPosition}
              onChange={(e) => setInsertPosition(e.target.value)}
              className="w-20 border border-[#777] px-2 py-1 text-sm"
            />
            <button
              onClick={handleInsertBetween}
              className="border border-[#777] bg-[#f5f5f5] px-3 py-1 text-sm font-normal text-black hover:bg-white"
            >
              Insert
            </button>
          </div>
        )}

        {submitted && (
          <div className="flex flex-wrap justify-between gap-x-8 gap-y-1 border border-[#52647b] bg-white px-2 py-1 text-[13px] text-[#000080]">
            <span><span className="font-normal">Rank:</span> {submitted.rank}</span>
            <span><span className="font-normal">Category:</span> {submitted.category}</span>
            <span><span className="font-normal">Gender:</span> {submitted.gender}</span>
          </div>
        )}

        <PreferenceList
          colleges={availableColleges}
          preferences={preferences}
          setPreferences={setPreferences}
          courseGroups={courseGroups?.map((group) => ({
            title: group.group,
            courses: group.branches.map((branch) => branch.code),
          }))}
        />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main
      className={`relative mx-auto ${
        step === "list"
          ? "max-w-[1375px] space-y-1.5 px-0 pb-4 pt-2 overflow-visible"
          : step === "details"
          ? "max-w-6xl space-y-6 px-1.5 sm:px-6 pb-12 pt-4 overflow-visible"
          : "max-w-6xl space-y-8 px-4 sm:px-6 pb-12 pt-6 overflow-hidden"
      }`}
    >
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
        <EmberField density={60} />

        <div
          className="pointer-events-none absolute inset-0 transition-[background] duration-150"
          style={{
            background: `radial-gradient(500px circle at ${spotlight.x}% ${spotlight.y}%, rgba(124,58,237,0.18), transparent 70%)`,
          }}
        />

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
            <span className="relative">{badgeText}</span>
          </motion.span>

          <h1
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490] bg-clip-text text-transparent">
              <ScrambleText text={heroTitle} duration={800} />
            </span>{" "}
            <span className="text-slate-900">Simulator</span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-2 text-base text-slate-500"
          >
            {heroSubtitle}
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
