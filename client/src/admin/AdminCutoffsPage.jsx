import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Search, Loader2 } from "lucide-react";

const apiBase = "/api";

const emptyForm = { collegeId: "", course: "", category: "", gender: "Male", cutoffRank: "" };

export default function AdminCutoffsPage() {
  const [rows, setRows] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCutoffs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`${apiBase}/admin/cutoffs?${params}`, { credentials: "include" });
      const json = await res.json();
      setRows(json.cutoffs ?? []);
    } catch (err) {
      console.error("Failed to load cutoffs", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetch(`${apiBase}/admin/colleges?pageSize=500`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => setColleges(json.colleges ?? []))
      .catch((err) => console.error("Failed to load colleges", err));

    fetch(`${apiBase}/courses`).then((r) => r.json()).then(setCourses).catch(console.error);
    fetch(`${apiBase}/categories`).then((r) => r.json()).then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchCutoffs, 250);
    return () => clearTimeout(t);
  }, [fetchCutoffs]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setErrors([]);
    setFormOpen(true);
  }

  function openEdit(row) {
    setForm({
      collegeId: String(row.college_id),
      course: row.course_code,
      category: row.category_code,
      gender: row.gender,
      cutoffRank: String(row.cutoff_rank),
    });
    setEditingId(row.id);
    setErrors([]);
    setFormOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      const res = await fetch(
        editingId ? `${apiBase}/admin/cutoffs/${editingId}` : `${apiBase}/admin/cutoffs`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.errors ?? [json.error ?? "Something went wrong"]);
        return;
      }
      setFormOpen(false);
      fetchCutoffs();
    } catch {
      setErrors(["Network error — please try again."]);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await fetch(`${apiBase}/admin/cutoffs/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setDeleteTarget(null);
      fetchCutoffs();
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Predictor Cutoffs</h2>
          <p className="mt-1 text-sm text-slate-500">
            College + course + category + gender cutoff ranks used by the predictor.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-gradient inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add cutoff
        </button>
      </div>

      <div className="glass mb-4 flex items-center gap-2 rounded-2xl p-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by college name or code..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="glass overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-white/60">
              <tr>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">College</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">Course</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">Category</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">Gender</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">Year</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">Cutoff</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No cutoff rows yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-brand-50/50">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800">{row.college_name}</p>
                      <p className="text-xs text-slate-400">{row.college_code}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{row.course_code}</td>
                    <td className="px-4 py-3.5 text-slate-600">{row.category_code}</td>
                    <td className="px-4 py-3.5 text-slate-600">{row.gender}</td>
                    <td className="px-4 py-3.5 text-slate-500">{row.year}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{row.cutoff_rank}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(row)}
                          aria-label={`Edit cutoff for ${row.college_name}`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(row)}
                          aria-label={`Delete cutoff for ${row.college_name}`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormOpen(false)}
              className="fixed inset-0 z-[90] bg-slate-900/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              role="dialog"
              aria-modal="true"
              className="glass-strong fixed left-1/2 top-1/2 z-[95] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[28px] p-6 sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit cutoff" : "Add cutoff"}
                </h3>
                <button
                  onClick={() => setFormOpen(false)}
                  aria-label="Close"
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-600">College</span>
                  <select
                    required
                    disabled={!!editingId}
                    value={form.collegeId}
                    onChange={(e) => setForm((f) => ({ ...f, collegeId: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60"
                  >
                    <option value="" disabled>Select a college...</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-600">Course</span>
                    <select
                      required
                      disabled={!!editingId}
                      value={form.course}
                      onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60"
                    >
                      <option value="" disabled>Select...</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-600">Category</span>
                    <select
                      required
                      disabled={!!editingId}
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60"
                    >
                      <option value="" disabled>Select...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-600">Gender</span>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-600">Cutoff rank</span>
                    <input
                      required
                      type="number"
                      min="1"
                      value={form.cutoffRank}
                      onChange={(e) => setForm((f) => ({ ...f, cutoffRank: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
                    />
                  </label>
                </div>

                {editingId && (
                  <p className="text-xs text-slate-400">
                    College, course, and category can't be changed on an existing row — delete and re-add if those need to change.
                  </p>
                )}

                {errors.length > 0 && (
                  <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600">
                    {errors.map((e, i) => <p key={i}>{e}</p>)}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-gradient flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold disabled:opacity-70"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Save changes" : "Add cutoff"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 z-[90] bg-slate-900/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="alertdialog"
              aria-modal="true"
              className="glass-strong fixed left-1/2 top-1/2 z-[95] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[28px] p-6"
            >
              <h3 className="text-lg font-bold text-slate-900">Delete this cutoff row?</h3>
              <p className="mt-2 text-sm text-slate-500">
                {deleteTarget.college_name} · {deleteTarget.course_code} · {deleteTarget.category_code} · {deleteTarget.gender}. This can't be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}