import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useToast } from "../components/ToastContext";
import { useReferenceData } from "../../hooks/useReferenceData";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const EMPTY_FORM = { collegeId: "", course: "", category: "", gender: "Male", cutoffRank: "" };

export default function CutoffFormModal({ open, cutoff, onClose, onSaved }) {
  const { addToast } = useToast();
  const { courses, categories } = useReferenceData();
  const isEdit = !!cutoff;

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCollegesLoading(true);
    adminApi
      .get("/admin/colleges?pageSize=500")
      .then((data) => setColleges(data.colleges ?? []))
      .catch((err) => addToast(err.message || "Failed to load colleges.", "error"))
      .finally(() => setCollegesLoading(false));
  }, [open, addToast]);

  useEffect(() => {
    if (!open) return;
    if (cutoff) {
      setForm({
        collegeId: String(cutoff.college_id),
        course: cutoff.course_code ?? "",
        category: cutoff.category_code ?? "",
        gender: cutoff.gender ?? "Male",
        cutoffRank: String(cutoff.cutoff_rank ?? ""),
      });
    } else {
      setForm({ ...EMPTY_FORM, course: courses[0]?.code ?? "", category: categories[0]?.code ?? "" });
    }
    setErrors([]);
  }, [open, cutoff, courses, categories]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      if (isEdit) {
        await adminApi.put(`/admin/cutoffs/${cutoff.id}`, form);
      } else {
        await adminApi.post("/admin/cutoffs", form);
      }
      onSaved();
    } catch (err) {
      if (err.body?.errors) {
        setErrors(err.body.errors);
      } else {
        addToast(err.message || "Failed to save cutoff.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-[160] max-h-[88vh] w-[94%] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {isEdit ? "Edit Cutoff" : "Add Cutoff"}
              </h3>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            {errors.length > 0 && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                <ul className="list-inside list-disc">
                  {errors.map((e) => <li key={e}>{e}</li>)}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="collegeId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  College
                </label>
                <select
                  id="collegeId"
                  value={form.collegeId}
                  onChange={(e) => update("collegeId", e.target.value)}
                  disabled={isEdit || collegesLoading}
                  required
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-900 transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="" disabled>
                    {collegesLoading ? "Loading colleges..." : "Select a college..."}
                  </option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              <Select
                id="course" label="Course" value={form.course}
                onChange={(e) => update("course", e.target.value)}
                disabled={isEdit}
                options={courses.map((c) => c.code)}
              />
              <Select
                id="category" label="Category" value={form.category}
                onChange={(e) => update("category", e.target.value)}
                disabled={isEdit}
                options={categories.map((c) => c.code)}
              />
              <Select
                id="gender" label="Gender" value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                options={["Male", "Female"]}
              />
              <Input
                id="cutoffRank" label="Cutoff Rank" type="number" min="1"
                value={form.cutoffRank}
                onChange={(e) => update("cutoffRank", e.target.value)}
                required
              />

              {isEdit && (
                <p className="text-xs text-slate-400 sm:col-span-2">
                  College, course, and category can't be changed on an existing cutoff — delete and re-add if those need to change.
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Cutoff"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}