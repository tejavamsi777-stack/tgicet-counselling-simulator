import { useEffect, useState, useCallback } from "react";
import { Power, Trash2, Filter } from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useToast } from "../components/ToastContext";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import Badge from "../../components/ui/Badge";
import { useAdminExam } from "../context/ExamContext";

export default function YearsPage() {
  const { addToast } = useToast();
  const { exams, selectedExam } = useAdminExam();

  const [filterExam, setFilterExam] = useState("all");
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null); // toggle-active target
  const [deleteTarget, setDeleteTarget] = useState(null);   // delete target

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.get(`/admin/years?exam=${filterExam}`);
      setYears(data);
    } catch (err) {
      addToast(err.message || "Failed to load years.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, filterExam]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmToggleActive() {
    const yearRow = confirmTarget;
    const nextActive = !yearRow.is_active;
    const prev = years;
    setYears((ys) => ys.map((y) => (y.id === yearRow.id ? { ...y, is_active: nextActive } : y)));
    setConfirmTarget(null);
    try {
      await adminApi.patch(`/admin/years/${yearRow.id}/active`, { isActive: nextActive });
      addToast(`${yearRow.year} (${yearRow.exam_short_name || "Exam"}) ${nextActive ? "shown to" : "hidden from"} students.`, "success");
    } catch (err) {
      setYears(prev);
      addToast(err.message || "Failed to update status.", "error");
    }
  }

  async function confirmDelete() {
    const yearRow = deleteTarget;
    setDeleteTarget(null);
    try {
      await adminApi.delete(`/admin/years/${yearRow.id}`);
      setYears((ys) => ys.filter((y) => y.id !== yearRow.id));
      addToast(`${yearRow.year} (${yearRow.exam_short_name || "Exam"}) and all its cutoff data were deleted.`, "success");
    } catch (err) {
      addToast(err.message || "Failed to delete year.", "error");
    }
  }

  const activeCount = years.filter((y) => y.is_active).length;

  const columns = [
    {
      key: "exam_short_name",
      header: "Exam",
      render: (row) => {
        const isIcet = row.exam_slug === "tg-icet";
        const isEapcet = row.exam_slug === "tg-eapcet";
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isIcet
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                : isEapcet
                ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {row.exam_short_name || row.exam_slug?.toUpperCase() || "TG ICET"}
          </span>
        );
      },
    },
    { key: "year", header: "Year" },
    {
      key: "cutoff_count",
      header: "Cutoff rows",
      render: (row) => (
        <span className={row.cutoff_count === 0 ? "text-amber-600 font-medium" : "text-slate-700 dark:text-slate-300"}>
          {(row.cutoff_count ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (row) => (
        <Badge tone={row.is_active ? "safe" : "neutral"}>
          {row.is_active ? "Visible to students" : "Hidden"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Years &amp; Data Sets — {filterExam === "all" ? "All Exams" : selectedExam.shortName}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage cutoff data years sorted by exam. Each uploaded Excel file is stored under its respective exam catalog.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {activeCount === 0 && "No years are active — students won't see any results."}
          {activeCount === 1 && "1 year active — students see it automatically."}
          {activeCount >= 2 && `${activeCount} years active across exams — students can switch between active years.`}
        </p>
      </div>

      {/* Exam Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 mr-2">
          <Filter size={14} /> Filter Exam:
        </span>
        <button
          onClick={() => setFilterExam("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            filterExam === "all"
              ? "bg-brand-600 text-white shadow"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          All Exams
        </button>
        {exams.map((ex) => (
          <button
            key={ex.slug}
            onClick={() => setFilterExam(ex.slug)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterExam === ex.slug
                ? "bg-brand-600 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {ex.shortName}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={years}
        loading={loading}
        emptyMessage={
          filterExam === "all"
            ? "No years found for any exam. Import a spreadsheet from the Import page to create one."
            : `No years found for ${exams.find((e) => e.slug === filterExam)?.shortName || filterExam}. Import a spreadsheet under this exam.`
        }
        renderActions={(row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setConfirmTarget(row)}
              title={row.is_active ? "Hide from students" : "Show to students"}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Power size={15} />
            </button>
            <button
              onClick={() => setDeleteTarget(row)}
              title="Delete year and all its cutoff data"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this year permanently?"
        message={`This will permanently delete ${deleteTarget?.year} (${deleteTarget?.exam_short_name || "Exam"}) and ALL its cutoff data. This cannot be undone.`}
        confirmLabel="Delete permanently"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        title="Change year visibility?"
        message={`${confirmTarget?.year} (${confirmTarget?.exam_short_name || "Exam"}) will be ${confirmTarget?.is_active ? "hidden from" : "shown to"} students.`}
        confirmLabel="Confirm"
        onCancel={() => setConfirmTarget(null)}
        onConfirm={confirmToggleActive}
      />
    </div>
  );
}