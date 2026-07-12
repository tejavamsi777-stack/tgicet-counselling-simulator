import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Power } from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useToast } from "../components/ToastContext";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import CollegeFormModal from "./CollegeFormModal";

const PAGE_SIZE = 15;

export default function CollegesPage() {
  const { addToast } = useToast();

  const [colleges, setColleges] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);

  const [confirmTarget, setConfirmTarget] = useState(null); // { type: 'delete'|'toggle', college }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (search.trim()) params.set("search", search.trim());
      const data = await adminApi.get(`/admin/colleges?${params.toString()}`);
      setColleges(data.colleges);
      setTotal(data.total);
    } catch (err) {
      addToast(err.message || "Failed to load colleges.", "error");
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
    setEditingCollege(null);
    setFormOpen(true);
  }

  function openEdit(college) {
    setEditingCollege(college);
    setFormOpen(true);
  }

  async function handleSaved() {
    setFormOpen(false);
    await load();
    addToast(editingCollege ? "College updated." : "College created.", "success");
  }

  async function confirmDelete() {
    const college = confirmTarget.college;
    // Optimistic: remove from list immediately, roll back on failure
    const prev = colleges;
    setColleges((cs) => cs.filter((c) => c.id !== college.id));
    setConfirmTarget(null);
    try {
      await adminApi.delete(`/admin/colleges/${college.id}`);
      addToast(`${college.name} deleted.`, "success");
      load();
    } catch (err) {
      setColleges(prev);
      addToast(err.message || "Failed to delete college.", "error");
    }
  }

  async function confirmToggleActive() {
    const college = confirmTarget.college;
    const nextActive = !college.is_active;
    const prev = colleges;
    setColleges((cs) => cs.map((c) => (c.id === college.id ? { ...c, is_active: nextActive } : c)));
    setConfirmTarget(null);
    try {
      await adminApi.patch(`/admin/colleges/${college.id}/active`, { isActive: nextActive });
      addToast(`${college.name} ${nextActive ? "activated" : "deactivated"}.`, "success");
    } catch (err) {
      setColleges(prev);
      addToast(err.message || "Failed to update status.", "error");
    }
  }

  const columns = [
    { key: "code", header: "Code" },
    { key: "name", header: "Name" },
    { key: "district_code", header: "District" },
    { key: "place", header: "Place" },
    {
      key: "is_active",
      header: "Status",
      render: (row) => (
        <Badge tone={row.is_active ? "safe" : "neutral"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Colleges</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage college records, cutoffs are updated via Excel Import.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Add College
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={colleges}
        loading={loading}
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by code or name..."
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        totalCount={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        emptyMessage="No colleges found."
        renderActions={(row) => (
          <>
            <button
              onClick={() => setConfirmTarget({ type: "toggle", college: row })}
              title={row.is_active ? "Deactivate" : "Activate"}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Power size={15} />
            </button>
            <button
              onClick={() => openEdit(row)}
              title="Edit"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => setConfirmTarget({ type: "delete", college: row })}
              title="Delete"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      />

      <CollegeFormModal
        open={formOpen}
        college={editingCollege}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.type === "delete" ? "Delete this college?" : "Change status?"}
        message={
          confirmTarget?.type === "delete"
            ? `This will permanently delete ${confirmTarget?.college?.name}. This cannot be undone.`
            : `${confirmTarget?.college?.name} will be ${confirmTarget?.college?.is_active ? "deactivated" : "activated"}.`
        }
        confirmLabel={confirmTarget?.type === "delete" ? "Delete" : "Confirm"}
        danger={confirmTarget?.type === "delete"}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={confirmTarget?.type === "delete" ? confirmDelete : confirmToggleActive}
      />
    </div>
  );
}