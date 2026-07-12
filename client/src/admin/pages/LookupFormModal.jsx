import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useToast } from "../components/ToastContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function LookupFormModal({ open, item, resource, singularLabel, onClose, onSaved }) {
  const { addToast } = useToast();
  const isEdit = !!item;

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCode(item?.code ?? "");
    setName(item?.name ?? "");
    setErrors([]);
  }, [open, item]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      if (isEdit) {
        // Backend only accepts { name } on update — code is immutable after creation.
        await adminApi.put(`/admin/lookups/${resource}/${item.id}`, { name });
      } else {
        await adminApi.post(`/admin/lookups/${resource}`, { code, name });
      }
      onSaved();
    } catch (err) {
      if (err.body?.errors) {
        setErrors(err.body.errors);
      } else {
        addToast(err.message || `Failed to save ${singularLabel.toLowerCase()}.`, "error");
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
            className="fixed left-1/2 top-1/2 z-[160] w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {isEdit ? `Edit ${singularLabel}` : `Add ${singularLabel}`}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="code" label="Code" value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isEdit} required
              />
              <Input
                id="name" label="Name" value={name}
                onChange={(e) => setName(e.target.value)} required
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : isEdit ? "Save Changes" : `Create ${singularLabel}`}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}