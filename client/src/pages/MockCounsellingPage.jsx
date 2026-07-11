import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import colleges2024 from "../data/colleges2024.json";
import { getFinalOptionList } from "../utils/sortByPreference";
import { saveOptions, loadOptions } from "../utils/mockCounsellingStorage";
import { exportPreferencesToPDF } from "../utils/exportPreferences";
import CollegeInfoModal from "../components/counselling/CollegeInfoModal";
import DisclaimerModal from "../components/counselling/DisclaimerModal";
import MockCounsellingLoader from "../components/counselling/MockCounsellingLoader";
import StepIndicator from "../components/counselling/StepIndicator";

import CandidateDetailsForm from "../components/counselling/CandidateDetailsForm";
import PreferenceForm from "../components/counselling/PreferenceForm";
import DistrictSelector from "../components/counselling/DistrictSelector";
import PreferenceList from "../components/counselling/PreferenceList";

export default function MockCounsellingPage() {
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);

  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OC");
  const [gender, setGender] = useState("Male");
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

  const [selectedCollege, setSelectedCollege] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const availableDistricts = useMemo(() => {
    return [...new Set(colleges2024.filter((c) => c.course === course).map((c) => c.district))].sort();
  }, [course]);

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
    const seen = new Set();
    const list = colleges2024.filter((c) => {
      if (c.course !== submitted.course) return false;
      if (!submitted.selectedDistricts.includes(c.district)) return false;
      if (seen.has(c.code)) return false;
      seen.add(c.code);
      return true;
    });
    return list.sort((a, b) => a.code.localeCompare(b.code));
  }, [submitted]);

  function handleSaveOptions() {
    if (!submitted) return;
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

  if (pageLoading) {
    return <MockCounsellingLoader onComplete={() => setPageLoading(false)} />;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="text-center">
        <span className="mb-3 inline-block rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700">
          Practice Web Options
        </span>
        <h1
          className="text-4xl font-bold tracking-tight sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490] bg-clip-text text-transparent">
            Mock Counselling
          </span>{" "}
          <span className="text-slate-900">Simulator</span>
        </h1>
        <p className="mt-2 text-slate-500">
          Select your district(s), then build your preference list.
        </p>
      </div>

      {step !== "list" && (
        <div className="pt-2">
          <StepIndicator step={step} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "candidate" && (
          <motion.div
            key="candidate"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-1 shadow-[0_20px_60px_rgba(76,29,149,0.08)]">
              <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490]" />
              <div className="p-6 sm:p-8">
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
            </div>
            <div className="text-center">
              <button
                onClick={handleCandidateSubmit}
                className="rounded-xl bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-1 shadow-[0_20px_60px_rgba(76,29,149,0.08)]">
              <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490]" />
              <div className="space-y-6 p-6 sm:p-8">
                <PreferenceForm course={course} setCourse={setCourse} />
                <DistrictSelector
                  districts={availableDistricts}
                  selectedDistricts={selectedDistricts}
                  setSelectedDistricts={setSelectedDistricts}
                  error={districtError}
                />
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={handleSubmit}
                className="rounded-xl bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Display Option Entry Form
              </button>
            </div>
          </motion.div>
        )}

        {step === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center gap-3 rounded-md bg-slate-200 p-3">
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
              <button
                onClick={handleSaveOptions}
                className="rounded border border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Save Options
              </button>
              <button
                onClick={handleViewAndPrint}
                className="rounded border border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                View &amp; Print
              </button>
              {statusMessage && (
                <span className="text-sm text-slate-600">{statusMessage}</span>
              )}
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
          </motion.div>
        )}
      </AnimatePresence>

      {selectedCollege && (
        <CollegeInfoModal college={selectedCollege} onClose={() => setSelectedCollege(null)} />
      )}
      {showDisclaimer && <DisclaimerModal onClose={() => setShowDisclaimer(false)} />}
    </main>
  );
}