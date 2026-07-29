import { useEffect, useState, useCallback } from "react";
import { Power } from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useToast } from "../components/ToastContext";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import Badge from "../../components/ui/Badge";

export default function YearsPage() {
  const { addToast } = useToast();

  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.get("/admin/years");
      setYears(data);
    } catch (err) {
      addToast(err.message || "Failed to load years.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

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
      addToast(`${yearRow.year} ${nextActive ? "shown to" : "hidden from"} students.`, "success");
    } catch (err) {
      setYears(prev);
      addToast(err.message || "Failed to update status.", "error");
    }
  }

  const activeCount = years.filter((y) => y.is_active).length;

  const columns = [
    { key: "year", header: "Year" },
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Years</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose which years' cutoff data students can see. Years are created automatically via Excel Import.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {activeCount === 0 && "No years are active — students won't see any results."}
          {activeCount === 1 && "1 year active — students see it automatically, no year selector shown."}
          {activeCount >= 2 && `${activeCount} years active — students can switch between them.`}
        </p>
      </div>

      <DataTable
        columns={columns}
        rows={years}
        loading={loading}
        emptyMessage="No years found. Import a spreadsheet to create one."
        renderActions={(row) => (
          <button
            onClick={() => setConfirmTarget(row)}
            title={row.is_active ? "Hide from students" : "Show to students"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Power size={15} />
          </button>
        )}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        title="Change year visibility?"
        message={`${confirmTarget?.year} will be ${confirmTarget?.is_active ? "hidden from" : "shown to"} students.`}
        confirmLabel="Confirm"
        onCancel={() => setConfirmTarget(null)}
        onConfirm={confirmToggleActive}
      />
    </div>
  );
}