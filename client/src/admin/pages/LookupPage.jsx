import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useToast } from "../components/ToastContext";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import Button from "../../components/ui/Button";
import LookupFormModal from "./LookupFormModal";

export default function LookupPage({ resource, title, singularLabel }) {
  const { addToast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.get(`/admin/lookups/${resource}`);
      setItems(data);
    } catch (err) {
      addToast(err.message || `Failed to load ${title.toLowerCase()}.`, "error");
    } finally {
      setLoading(false);
    }
  }, [resource, title, addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = search.trim()
    ? items.filter(
        (i) =>
          i.code.toLowerCase().includes(search.trim().toLowerCase()) ||
          i.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    : items;

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setFormOpen(true);
  }

  async function handleSaved() {
    setFormOpen(false);
    await load();
    addToast(editingItem ? `${singularLabel} updated.` : `${singularLabel} created.`, "success");
  }

  async function confirmDelete() {
    const item = deleteTarget;
    const prev = items;
    setItems((its) => its.filter((i) => i.id !== item.id));
    setDeleteTarget(null);
    try {
      await adminApi.delete(`/admin/lookups/${resource}/${item.id}`);
      addToast(`${item.name} deleted.`, "success");
    } catch (err) {
      setItems(prev);
      addToast(err.message || `Failed to delete ${singularLabel.toLowerCase()}.`, "error");
    }
  }

  const columns = [
    { key: "code", header: "Code" },
    { key: "name", header: "Name" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage {title.toLowerCase()} used across predictions and colleges.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Add {singularLabel}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${title.toLowerCase()}...`}
        emptyMessage={`No ${title.toLowerCase()} found.`}
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

      <LookupFormModal
        open={formOpen}
        item={editingItem}
        resource={resource}
        singularLabel={singularLabel}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete this ${singularLabel.toLowerCase()}?`}
        message={`This will permanently delete ${deleteTarget?.name}. Colleges or cutoffs referencing it may be affected.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}