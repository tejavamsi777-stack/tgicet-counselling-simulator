import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useToast } from "../components/ToastContext";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

export default function ImportPage() {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const [previewing, setPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [previewError, setPreviewError] = useState("");

  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState(null);
  const [commitError, setCommitError] = useState(null); // { message, details }

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

  const canCommit = previewResult?.isValid && year.trim() && !committing;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Excel Import</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload a cutoffs spreadsheet, review it, then commit to the database.
        </p>
      </div>

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
  );
}