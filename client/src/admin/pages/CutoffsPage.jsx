import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useToast } from "../components/ToastContext";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import Button from "../../components/ui/Button";
import CutoffFormModal from "./CutoffFormModal";

const PAGE_SIZE = 15;

export default function CutoffsPage() {
  const { addToast } = useToast();

  const [cutoffs, setCutoffs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCutoff, setEditingCutoff] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (search.trim()) params.set("search", search.trim());
      const data = await adminApi.get(`/admin/cutoffs?${params.toString()}`);
      setCutoffs(data.cutoffs);
      setTotal(data.total);
    } catch (err) {
      addToast(err.message || "Failed to load cutoffs.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, addToast]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearchChange(value) {
    setSearch(value);
    setPage(1);
  }

  function openCreate() {
    setEditingCutoff(null);
    setFormOpen(true);
  }

  function openEdit(cutoff) {
    setEditingCutoff(cutoff);
    setFormOpen(true);
  }

  async function handleSaved() {
    setFormOpen(false);
    await load();
    addToast(editingCutoff ? "Cutoff updated." : "Cutoff created.", "success");
  }

  async function confirmDelete() {
    const cutoff = deleteTarget;
    const prev = cutoffs;
    setCutoffs((cs) => cs.filter((c) => c.id !== cutoff.id));
    setDeleteTarget(null);
    try {
      await adminApi.delete(`/admin/cutoffs/${cutoff.id}`);
      addToast(`Cutoff for ${cutoff.college_name} deleted.`, "success");
      load();
    } catch (err) {
      setCutoffs(prev);
      addToast(err.message || "Failed to delete cutoff.", "error");
    }
  }

  const columns = [
    {
      key: "college_name",
      header: "College",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">{row.college_name}</p>
          <p className="text-xs text-slate-400">{row.college_code}</p>
        </div>
      ),
    },
    { key: "course_code", header: "Course" },
    { key: "category_code", header: "Category" },
    { key: "gender", header: "Gender" },
    { key: "year", header: "Year" },
    { key: "cutoff_rank", header: "Cutoff" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cutoffs</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage individual cutoff ranks used by the predictor. Bulk changes still go through Excel Import.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Add Cutoff
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={cutoffs}
        loading={loading}
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by college code or name..."
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        totalCount={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        emptyMessage="No cutoffs found."
        renderActions={(row) => (
          <>
            <button
              onClick={() => openEdit(row)}
              title="Edit"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => setDeleteTarget(row)}
              title="Delete"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      />

      <CutoffFormModal
        open={formOpen}
        cutoff={editingCutoff}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this cutoff?"
        message={`This will permanently delete the ${deleteTarget?.course_code} / ${deleteTarget?.category_code} / ${deleteTarget?.gender} cutoff for ${deleteTarget?.college_name}. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}