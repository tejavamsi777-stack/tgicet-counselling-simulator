import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { api } from "../../lib/api";
import { getFinalOptionList } from "../../utils/sortByPreference";
import { saveOptions, loadOptions } from "../../utils/mockCounsellingStorage";
import { exportPreferencesToPDF } from "../../utils/exportPreferences";
import { getDuplicatePreferenceNumbers } from "../../utils/preferenceValidation";
import CandidateDetailsForm from "../../components/counselling/CandidateDetailsForm";
import DistrictSelector from "../../components/counselling/DistrictSelector";
import PreferenceList from "../../components/counselling/PreferenceList";
import ScrambleText from "../../components/effects/ScrambleText";
import { GlowCard } from "../../components/ui/spotlight-card";
import { GlassButton } from "../../components/ui/glass-button";
import AdSenseUnit from "../../components/ads/AdSenseUnit";
import Seo from "../../components/shared/Seo";
import { EXAM_COURSE_GROUPS } from "../../config/courseGroups";

const stepVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

export default function EcetMockCounsellingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const heroRef = useRef(null);

  const EXAM_SLUG = "tg-ecet";
  const STORAGE_NS = "tgecet";

  const listCourseGroups = EXAM_COURSE_GROUPS[EXAM_SLUG].preferenceGroups;
  const selectorCourseGroups = EXAM_COURSE_GROUPS[EXAM_SLUG].selectorGroups;

  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [candidateError, setCandidateError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info");

  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [step, setStep] = useState("candidate");
  const [submitted, setSubmitted] = useState(null);
  const [preferences, setPreferences] = useState({});

  const [showInsertPanel, setShowInsertPanel] = useState(false);
  const [insertCollege, setInsertCollege] = useState("");
  const [insertPosition, setInsertPosition] = useState("");

  const saveShake = useAnimation();
  const printShake = useAnimation();
  const hasDuplicates = getDuplicatePreferenceNumbers(preferences).length > 0;

  function shake(controls) {
    controls.start({ x: [0, -8, 8, -8, 8, -4, 4, 0], transition: { duration: 0.4 } });
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
        const colleges = await api.get(`/colleges?exam=${EXAM_SLUG}`);
        if (!cancelled) {
          setAllColleges(colleges.map((c) => ({ ...c, district: c.district_code, districtName: c.district_name })));
        }
      } catch (err) {
        if (!cancelled) { setCollegesError(err.message || "Failed to load colleges."); setAllColleges([]); }
      } finally {
        if (!cancelled) setCollegesLoading(false);
      }
    }
    fetchColleges();
    return () => { cancelled = true; };
  }, []);

  // Auto-load options if navigated from Smart Web Options Generator on Predictor page
  useEffect(() => {
    if (location.state?.autoLoad || location.search.includes("from=smart_options")) {
      const saved = loadOptions(STORAGE_NS);
      if (saved) {
        const c = {
          rank: saved.criteria?.rank ?? "",
          category: saved.criteria?.category ?? "OC",
          gender: saved.criteria?.gender ?? "Male",
          selectedDistricts: saved.criteria?.selectedDistricts ?? [],
        };
        setRank(c.rank);
        setCategory(c.category);
        setGender(c.gender);
        setSelectedDistricts(c.selectedDistricts);
        setSubmitted(c);
        setPreferences(saved.preferences || {});
        setStep("list");
        setStatusMessage(`✨ Loaded ${Object.keys(saved.preferences || {}).length} smart web options generated for rank ${c.rank}`);
        setStatusType("success");
      }
    }
  }, [location]);

  const availableDistricts = useMemo(
    () => [...new Set(allColleges.map((c) => c.district))].sort(),
    [allColleges]
  );

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
    if (rank.toString().trim() === "") { setCandidateError("Please enter your TG ECET Rank"); return; }
    if (category === "") { setCategory("Please select your category"); return; }
    if (gender === "") { setGender("Please select your gender"); return; }
    setCandidateError("");
    setStep("details");
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [step]);

  function handleSubmit() {
    if (selectedDistricts.length === 0) { setDistrictError("Please select at least one district"); return; }
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

  function handleSaveOptions() {
    if (!submitted) return;
    const dupes = getDuplicatePreferenceNumbers(preferences);
    if (dupes.length > 0) { setStatusMessage(`Fix duplicate preference number(s) before saving: ${dupes.join(", ")}`); setStatusType("error"); shake(saveShake); return; }
    saveOptions(submitted, preferences, STORAGE_NS);
    setStatusMessage("Options saved to this browser.");
    setStatusType("success");
  }

  function handleLoadLastSaved() {
    const saved = loadOptions(STORAGE_NS);
    if (!saved) { setStatusMessage("No saved options found on this device."); return; }
    const c = { rank: saved.criteria.rank ?? "", category: saved.criteria.category ?? "OC", gender: saved.criteria.gender ?? "Male", selectedDistricts: saved.criteria.selectedDistricts ?? [] };
    setRank(c.rank); setCategory(c.category); setGender(c.gender); setSelectedDistricts(c.selectedDistricts);
    setSubmitted(c); setPreferences(saved.preferences); setStep("list");
    setStatusMessage(`Loaded options saved on ${new Date(saved.savedAt).toLocaleString()}.`);
  }

  function performPrint() {
    const dupes = getDuplicatePreferenceNumbers(preferences);
    if (dupes.length > 0) { setStatusMessage(`Fix duplicate preference number(s) before printing: ${dupes.join(", ")}`); setStatusType("error"); shake(printShake); return; }
    const finalList = getFinalOptionList(availableColleges, preferences);
    if (finalList.length === 0) { setStatusMessage("Assign at least one preference number before printing."); setStatusType("error"); return; }
    exportPreferencesToPDF(finalList, submitted);
    setStatusMessage("PDF downloaded successfully.");
    setStatusType("success");
  }

  function handleViewAndPrint() {
    performPrint();
  }

  function handleInsertBetween() {
    if (!insertCollege || insertPosition === "") { setStatusMessage("Pick a college and a position to insert at."); return; }
    const pos = Number(insertPosition);
    setPreferences((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((code) => { if (updated[code] !== "" && Number(updated[code]) >= pos) updated[code] = Number(updated[code]) + 1; });
      updated[insertCollege] = pos;
      return updated;
    });
    setStatusMessage(`Inserted ${insertCollege} at position ${pos}, shifted the rest down.`);
    setInsertCollege(""); setInsertPosition(""); setShowInsertPanel(false);
  }

  let stepContent = null;

  if (step === "candidate") {
    stepContent = (
      <CandidateDetailsForm
        rank={rank}
        setRank={setRank}
        category={category}
        setCategory={setCategory}
        gender={gender}
        setGender={setGender}
        error={candidateError}
        examSlug="tg-ecet"
        onSubmit={handleCandidateSubmit}
      />
    );
  } else if (step === "details") {
    stepContent = (
      <div className="space-y-6">
        {collegesLoading ? (
          <GlowCard customSize={true} glowColor="purple" className="p-8 text-center text-gray-300">Loading districts...</GlowCard>
        ) : (
          <GlowCard customSize={true} glowColor="purple" className="p-6 sm:p-8">
            <DistrictSelector districts={availableDistricts} selectedDistricts={selectedDistricts} setSelectedDistricts={setSelectedDistricts} error={districtError} courseGroups={selectorCourseGroups} />
          </GlowCard>
        )}
        <div className="flex justify-center">
          <GlassButton onClick={handleSubmit} size="lg">
            Display Option Entry Form
          </GlassButton>
        </div>
      </div>
    );
  } else if (step === "list") {
    stepContent = (
      <div className="space-y-1.5" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div className="sticky top-0 z-30 flex flex-wrap items-center justify-center gap-2 border border-white/20 bg-[#161224]/90 px-3 py-1.5 backdrop-blur-xl rounded-xl">
          <button onClick={() => setStep("details")} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20">Back to Districts</button>
          <button onClick={handleLoadLastSaved} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20">Last Saved Options</button>
          <button onClick={() => setShowInsertPanel((v) => !v)} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20">Enter Between Options</button>
          <motion.button animate={saveShake} onClick={handleSaveOptions} className={`rounded-lg border px-3 py-1 text-xs font-semibold ${hasDuplicates ? "cursor-not-allowed border-rose-500/40 bg-rose-500/20 text-rose-300" : "border-white/20 bg-white/10 text-white hover:bg-white/20"}`}>Save Options</motion.button>
          <motion.button animate={printShake} onClick={handleViewAndPrint} className={`rounded-lg border px-3 py-1 text-xs font-semibold ${hasDuplicates ? "cursor-not-allowed border-rose-500/40 bg-rose-500/20 text-rose-300" : "border-white/20 bg-white/10 text-white hover:bg-white/20"}`}>View &amp; Print</motion.button>
          {statusMessage && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${statusType === "error" ? "text-rose-400" : statusType === "success" ? "text-emerald-400" : "text-gray-300"}`}>
              {statusType === "success" && <ThumbsUp size={14} />}
              {statusType === "error" && <ThumbsDown size={14} />}
              {statusMessage}
            </span>
          )}
        </div>

        {showInsertPanel && (
          <div className="flex flex-wrap items-center gap-2 border border-white/20 bg-[#161224]/90 p-3 text-xs text-white rounded-xl backdrop-blur-xl">
            <label className="font-semibold text-gray-300">Insert college</label>
            <select value={insertCollege} onChange={(e) => setInsertCollege(e.target.value)} className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs text-white">
              <option value="" className="bg-[#161224] text-white">Select college</option>
              {availableColleges.flatMap((c) => (c.courses || []).map((course) => (
                <option key={`${c.code}_${course}`} value={`${c.code}_${course}`} className="bg-[#161224] text-white">{c.code} ({course}) — {c.name}</option>
              )))}
            </select>
            <label className="font-semibold text-gray-300">at position</label>
            <input type="number" min="1" value={insertPosition} onChange={(e) => setInsertPosition(e.target.value)} className="w-20 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs text-white" />
            <button onClick={handleInsertBetween} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20">Insert</button>
          </div>
        )}

        {submitted && (
          <div className="flex flex-wrap justify-between gap-x-8 gap-y-1 border border-white/20 bg-[#161224]/90 px-4 py-2 text-xs font-medium text-purple-300 rounded-xl backdrop-blur-xl">
            <span><span className="text-gray-400">Rank:</span> {submitted.rank}</span>
            <span><span className="text-gray-400">Category:</span> {submitted.category}</span>
            <span><span className="text-gray-400">Gender:</span> {submitted.gender}</span>
          </div>
        )}

        <PreferenceList colleges={availableColleges} preferences={preferences} setPreferences={setPreferences} />
      </div>
    );
  }

  return (
    <main className={`relative mx-auto overflow-visible ${step === "list" ? "max-w-[1375px] space-y-1.5 px-0 pb-4 pt-2" : "max-w-6xl space-y-8 px-6 pb-44 pt-6"}`}>
      <Seo
        title="TG ECET 2027 Web Options Simulator | Mock Option Entry Practice Portal"
        description="Practice TG ECET 2027 lateral entry web options entry with zero risk. Official portal replica with real college codes, branch priority reordering, and PDF export."
        keywords="tg ecet web options simulator 2027, ts ecet mock counselling portal, tgecet.nic.in web options demo practice, tg ecet lateral entry web options"
        path="/exams/tg-ecet/mock-counselling"
        toolType="simulator"
        examName="TG ECET"
      />
      {/* OFFICIAL SIMULATION DISCLAIMER RIBBON */}
      <div className="w-full rounded-xl border border-red-500/40 bg-red-950/40 p-2.5 sm:px-4 sm:py-2 text-center shadow-lg backdrop-blur-md">
        <p className="text-xs sm:text-sm font-bold text-red-300 tracking-wide flex items-center justify-center gap-1.5">
          <span className="text-red-400">⚠️</span>
          <span>
            <strong>NOTE:</strong> This is a <strong>Mock Web Options Simulator</strong> for candidate practice and preference ordering only. This is <u>NOT</u> the official TGCHE website. Submit your final web options on <strong>tgecet.nic.in</strong>.
          </span>
        </p>
      </div>

      <button onClick={handleBack} className="relative z-10 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-300 hover:text-white">
        <ArrowLeft size={16} /> Back
      </button>

      <div ref={heroRef}>
        <GlowCard customSize={true} glowColor="purple" className="p-8 sm:p-12 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300 backdrop-blur-sm">
            <Sparkles size={12} />
            <span>TG ECET Practice Web Options</span>
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            <ScrambleText text="ECET Mock Counselling" duration={800} /> Simulator
          </h1>
          <p className="mt-3 text-base text-gray-300">
            TG ECET (Diploma Lateral Entry) — Select your district(s), then build your preference list.
          </p>
        </GlowCard>
      </div>

      {collegesError && <div className="rounded-2xl border border-red-500/40 bg-red-500/20 px-4 py-3 text-xs font-semibold text-red-200">{collegesError}</div>}

      <AnimatePresence mode="wait">
        <motion.div key={step} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="relative z-30">
          {stepContent}
        </motion.div>
      </AnimatePresence>

      {/* Passive ad placement outside interactive counselling controls */}
      {step !== "list" && (
        <AdSenseUnit slotName="mockCounselling" minHeight={90} />
      )}
    </main>
  );
}
