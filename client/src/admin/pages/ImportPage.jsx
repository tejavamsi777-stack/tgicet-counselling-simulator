import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, X, Globe, Database, Sparkles, RefreshCw, Server } from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useToast } from "../components/ToastContext";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAdminExam } from "../context/ExamContext";

export default function ImportPage() {
  const { addToast } = useToast();
  const { selectedExam } = useAdminExam();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("allotments"); // 'allotments' | 'cutoffs'

  // --- Cutoffs Excel State ---
  const [file, setFile] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [previewing, setPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState(null);
  const [commitError, setCommitError] = useState(null);

  // --- Official Allotment Live Ingestion State ---
  const [allotmentExam, setAllotmentExam] = useState("tg-eapcet");
  const [allotmentYear, setAllotmentYear] = useState("2026");
  const [allotmentPhase, setAllotmentPhase] = useState("final");
  const [collegeCode, setCollegeCode] = useState("CBIT");
  const [branchCode, setBranchCode] = useState("CSE");
  const [fetchingLive, setFetchingLive] = useState(false);
  const [livePreview, setLivePreview] = useState(null);
  const [liveError, setLiveError] = useState("");
  const [committingLive, setCommittingLive] = useState(false);
  const [liveCommitResult, setLiveCommitResult] = useState(null);

  // Dropdown options
  const collegesList = [
    { code: "CBIT", name: "CBIT - Chaitanya Bharathi Institute of Technology" },
    { code: "JNTH", name: "JNTH - JNTUH University College of Engineering" },
    { code: "OUCE", name: "OUCE - University College of Engineering, Osmania" },
    { code: "VASV", name: "VASV - Vasavi College of Engineering" },
    { code: "VJEC", name: "VJEC - VNR Vignana Jyothi Institute of Engineering" },
    { code: "VMEG", name: "VMEG - Vardhaman College of Engineering" },
    { code: "KMIT", name: "KMIT - Keshav Memorial Institute of Technology" },
    { code: "MGIT", name: "MGIT - Mahatma Gandhi Institute of Technology" },
    { code: "CVRH", name: "CVRH - CVR College of Engineering" },
    { code: "GRRR", name: "GRRR - Gokaraju Rangaraju Institute of Engg" },
    { code: "AARM", name: "AARM - Aar Mahaveer Engineering College" },
    { code: "ACEG", name: "ACEG - ACE Engineering College" },
    { code: "BVRI", name: "BVRI - B V Raju Institute of Technology" },
    { code: "BVRW", name: "BVRW - BVRIT Hyderabad College of Engg for Women" },
    { code: "GNTW", name: "GNTW - G.Narayanamma Institute of Tech for Women" },
  ];

  const branchesList = [
    { code: "CSE", name: "Computer Science & Engineering (CSE)" },
    { code: "CSM", name: "AI & Machine Learning (CSM)" },
    { code: "AID", name: "AI & Data Science (AID)" },
    { code: "AIM", name: "AI & Machine Learning (AIM)" },
    { code: "INF", name: "Information Technology (INF)" },
    { code: "ECE", name: "Electronics & Communication Engg (ECE)" },
    { code: "EEE", name: "Electrical & Electronics Engg (EEE)" },
    { code: "CIV", name: "Civil Engineering (CIV)" },
    { code: "MEC", name: "Mechanical Engineering (MEC)" },
  ];

  function resetAll() {
    setFile(null);
    setPreviewResult(null);
    setPreviewError("");
    setCommitResult(null);
    setCommitError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setPreviewResult(null);
    setPreviewError("");
    setCommitResult(null);
    setCommitError(null);
  }

  async function handlePreview() {
    if (!file) return;
    setPreviewing(true);
    setPreviewError("");
    setPreviewResult(null);
    setCommitResult(null);
    setCommitError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await adminApi.postFile("/admin/import/preview", formData);
      setPreviewResult(result);
    } catch (err) {
      setPreviewError(err.message || "Failed to validate file.");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleCommit() {
    if (!file || !year) return;
    setCommitting(true);
    setCommitError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("year", year);
      formData.append("exam", selectedExam.slug);
      const result = await adminApi.postFile("/admin/import/commit", formData);
      setCommitResult(result);
      addToast(`Import complete — ${result.rowsProcessed} rows processed.`, "success");
    } catch (err) {
      if (err.body?.details) {
        setCommitError({ message: err.message, details: err.body.details });
      } else {
        addToast(err.message || "Import failed.", "error");
      }
    } finally {
      setCommitting(false);
    }
  }

  // --- Official Live Fetch & Commit Handlers ---
  async function handleFetchOfficialLive() {
    setFetchingLive(true);
    setLiveError("");
    setLivePreview(null);
    setLiveCommitResult(null);
    try {
      const res = await adminApi.post("/admin/eapcet/allotments/fetch-live", {
        examId: allotmentExam,
        admissionYear: parseInt(allotmentYear, 10),
        phase: allotmentPhase,
        collegeCode,
        branchCode
      });
      const data = res.data;
      if (!data || !data.available || !data.parsedRecords || data.parsedRecords.length === 0) {
        setLiveError(data?.reason || `No official allotment records found for ${collegeCode} - ${branchCode}.`);
      } else {
        setLivePreview(data);
        addToast(`Fetched ${data.totalRecords} official records for ${collegeCode} - ${branchCode}`, "success");
      }
    } catch (err) {
      setLiveError(err.message || "Failed to connect to official portal.");
    } finally {
      setFetchingLive(false);
    }
  }

  async function handleCommitLive() {
    if (!livePreview || !livePreview.parsedRecords || livePreview.parsedRecords.length === 0) return;
    setCommittingLive(true);
    try {
      const res = await adminApi.post("/admin/eapcet/allotments/commit", {
        records: livePreview.parsedRecords,
        meta: livePreview.meta
      });
      setLiveCommitResult(res.data);
      addToast(`Idempotent import complete! New: ${res.data.newRecordsInserted}, Duplicates: ${res.data.duplicatesSkipped}`, "success");
    } catch (err) {
      addToast(err.message || "Failed to commit allotment dataset.", "error");
    } finally {
      setCommittingLive(false);
    }
  }

  const canCommit = previewResult?.isValid && year.trim() && !committing;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Data Ingestion Hub</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage official seat allotment orders from official state counselling portals and historical cutoff spreadsheets.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("allotments")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition cursor-pointer ${
            activeTab === "allotments"
              ? "border-b-2 border-brand-500 text-brand-600 bg-brand-50/50 dark:bg-brand-950/20 dark:text-brand-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Globe size={16} />
          <span>Official Live Seat Allotments</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cutoffs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition cursor-pointer ${
            activeTab === "cutoffs"
              ? "border-b-2 border-brand-500 text-brand-600 bg-brand-50/50 dark:bg-brand-950/20 dark:text-brand-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <FileSpreadsheet size={16} />
          <span>Cutoffs Spreadsheet Import</span>
        </button>
      </div>

      {/* ── TAB 1: OFFICIAL LIVE ALLOTMENTS INGESTION ── */}
      {activeTab === "allotments" && (
        <div className="space-y-6">
          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Server size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Official Counselling Portal Extractor</h2>
                  <p className="text-xs text-slate-500">Live authoritative session extractor with idempotent database commit</p>
                </div>
              </div>
              <Badge tone="safe">Idempotent DB Engine</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                  Counselling Exam
                </label>
                <select
                  value={allotmentExam}
                  onChange={(e) => setAllotmentExam(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="tg-eapcet">TG EAPCET (tgeapcet.nic.in)</option>
                  <option value="tg-ecet">TG ECET (tgecet.nic.in)</option>
                  <option value="tg-polycet">TG POLYCET (tgpolycet.nic.in)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                  Admission Year
                </label>
                <select
                  value={allotmentYear}
                  onChange={(e) => setAllotmentYear(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="2026">2026 (Latest Cycle)</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                  Phase
                </label>
                <select
                  value={allotmentPhase}
                  onChange={(e) => setAllotmentPhase(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="final">Final Phase</option>
                  <option value="phase1">Phase 1</option>
                  <option value="phase2">Phase 2</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                  College Code
                </label>
                <select
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {collegesList.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name.split("-")[1] || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                  Branch
                </label>
                <select
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {branchesList.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Button onClick={handleFetchOfficialLive} disabled={fetchingLive} variant="primary">
                <Globe size={16} />
                {fetchingLive ? "Fetching Official Records..." : "Fetch Official Live Data"}
              </Button>
              {livePreview && (
                <Button onClick={handleCommitLive} disabled={committingLive || !livePreview?.parsedRecords?.length} variant="secondary">
                  <Database size={16} />
                  {committingLive ? "Importing to DB..." : `Commit to Database (${livePreview.totalRecords} Records)`}
                </Button>
              )}
            </div>
          </Card>

          {liveError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              {liveError}
            </div>
          )}

          {liveCommitResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200 space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-base">
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span>Dataset Ingestion Complete!</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-2">
                <div>Total Processed: <b>{liveCommitResult.totalProcessed}</b></div>
                <div>New Inserted: <b className="text-emerald-600 dark:text-emerald-400">{liveCommitResult.newRecordsInserted}</b></div>
                <div>Duplicates Skipped: <b className="text-slate-500">{liveCommitResult.duplicatesSkipped}</b></div>
                <div>Log ID: <b className="truncate">{liveCommitResult.importLogId || "Recorded"}</b></div>
              </div>
            </motion.div>
          )}

          {livePreview && livePreview.parsedRecords && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Total Verified Seats</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">{livePreview.totalRecords}</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Opening Rank</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono mt-1">#{livePreview.openingRank?.toLocaleString()}</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Closing Rank</div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">#{livePreview.closingRank?.toLocaleString()}</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Gender Split</div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono mt-2">
                    M: {livePreview.genderSplit?.male} ({livePreview.genderSplit?.malePercent}%) | F: {livePreview.genderSplit?.female} ({livePreview.genderSplit?.femalePercent}%)
                  </div>
                </Card>
              </div>

              {/* Table Preview */}
              <Card className="overflow-hidden dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center">
                  <span>Candidate Records Preview (Showing first 25 of {livePreview.totalRecords})</span>
                  <span className="text-xs font-mono text-slate-400">Source: https://tgeapcet.nic.in/</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 text-left">#</th>
                        <th className="py-2.5 px-3 text-left">Rank</th>
                        <th className="py-2.5 px-3 text-left">Hall Ticket No</th>
                        <th className="py-2.5 px-3 text-left">Candidate Name</th>
                        <th className="py-2.5 px-3 text-left">Gender</th>
                        <th className="py-2.5 px-3 text-left">Caste</th>
                        <th className="py-2.5 px-3 text-left">Region</th>
                        <th className="py-2.5 px-3 text-left">Seat Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {livePreview.parsedRecords.slice(0, 25).map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-mono text-slate-400">{i + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-purple-600 dark:text-purple-400">#{r.rank}</td>
                          <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">{r.rollNo}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{r.candidateName}</td>
                          <td className="py-2 px-3">{r.gender}</td>
                          <td className="py-2 px-3 font-mono">{r.caste}</td>
                          <td className="py-2 px-3 font-mono text-slate-500">{r.region}</td>
                          <td className="py-2 px-3 font-mono font-bold text-xs text-brand-600 dark:text-brand-400">{r.seatCategory}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* ── TAB 2: CUTOFFS EXCEL IMPORT ── */}
      {activeTab === "cutoffs" && (
        <div className="space-y-6">
          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_180px]">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Spreadsheet file
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex h-11 flex-1 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-sm text-slate-500 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                    <UploadCloud size={16} />
                    {file ? file.name : "Choose .xlsx or .csv file..."}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {file && (
                    <button
                      onClick={resetAll}
                      title="Clear"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <Input
                id="import-year" label="Year" type="number"
                placeholder="e.g. 2025" value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>

            <div className="mt-5 flex gap-3">
              <Button onClick={handlePreview} disabled={!file || previewing} variant="secondary">
                <FileSpreadsheet size={16} />
                {previewing ? "Validating…" : "Preview"}
              </Button>
              <Button onClick={handleCommit} disabled={!canCommit}>
                <CheckCircle2 size={16} />
                {committing ? "Importing…" : "Commit Import"}
              </Button>
            </div>

            {!year.trim() && previewResult?.isValid && (
              <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                Enter a year before committing.
              </p>
            )}
          </Card>

          {previewError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {previewError}
            </div>
          )}

          {previewResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={previewResult.isValid ? "safe" : "risky"}>
                  {previewResult.isValid ? "Valid — ready to import" : "Has errors — fix before importing"}
                </Badge>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {previewResult.totalRows} data row{previewResult.totalRows === 1 ? "" : "s"} found
                </span>
              </div>

              {previewResult.errors.length > 0 && (
                <Card className="overflow-hidden dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 dark:border-red-500/10 dark:bg-red-500/10 dark:text-red-400">
                    <AlertTriangle size={15} />
                    Errors ({previewResult.errors.length}{previewResult.errors.length === 50 ? "+ — showing first 50" : ""})
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        {previewResult.errors.map((e, i) => (
                          <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                            <td className="w-20 px-4 py-2 font-mono text-xs text-slate-400">Row {e.row}</td>
                            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{e.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {previewResult.duplicates.length > 0 && (
                <Card className="overflow-hidden dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 dark:border-amber-500/10 dark:bg-amber-500/10 dark:text-amber-400">
                    <AlertTriangle size={15} />
                    Duplicate rows ({previewResult.duplicates.length})
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        {previewResult.duplicates.map((d, i) => (
                          <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                            <td className="w-20 px-4 py-2 font-mono text-xs text-slate-400">Row {d.row}</td>
                            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{d.key}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {previewResult.preview.length > 0 && (
                <Card className="overflow-hidden dark:border-slate-800 dark:bg-slate-900">
                  <div className="border-b border-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-300">
                    Preview (first {previewResult.preview.length} rows)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                          {Object.keys(previewResult.preview[0]).map((k) => (
                            <th key={k} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewResult.preview.map((row, i) => (
                          <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                            {Object.values(row).map((v, j) => (
                              <td key={j} className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-300">
                                {String(v)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {commitError && (
            <Card className="overflow-hidden dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 dark:border-red-500/10 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle size={15} />
                {commitError.message}
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {commitError.details.map((e, i) => (
                      <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="w-20 px-4 py-2 font-mono text-xs text-slate-400">Row {e.row}</td>
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {commitResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
            >
              <CheckCircle2 size={16} />
              Import successful — {commitResult.rowsProcessed} rows processed.
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
