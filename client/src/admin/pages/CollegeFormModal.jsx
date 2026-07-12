import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useToast } from "../components/ToastContext";
import { useReferenceData } from "../../hooks/useReferenceData";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const EMPTY_FORM = {
  code: "", name: "", district: "", place: "", university: "",
  ownershipType: "", website: "", address: "", phone: "", email: "",
  isMinority: false, isGirls: false, isSelfFinance: false,
};

export default function CollegeFormModal({ open, college, onClose, onSaved }) {
  const { addToast } = useToast();
  const { districts } = useReferenceData();
  const isEdit = !!college;

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (college) {
      setForm({
        code: college.code ?? "",
        name: college.name ?? "",
        district: college.district_code ?? "",
        place: college.place ?? "",
        university: college.university ?? "",
        ownershipType: college.ownership_type ?? "",
        website: college.website ?? "",
        address: college.address ?? "",
        phone: college.phone ?? "",
        email: college.email ?? "",
        isMinority: !!college.is_minority,
        isGirls: !!college.is_girls,
        isSelfFinance: !!college.is_self_finance,
      });
    } else {
      setForm({ ...EMPTY_FORM, district: districts[0]?.code ?? "" });
    }
    setErrors([]);
  }, [open, college, districts]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      if (isEdit) {
        await adminApi.put(`/admin/colleges/${college.id}`, form);
      } else {
        await adminApi.post("/admin/colleges", form);
      }
      onSaved();
    } catch (err) {
      if (err.body?.errors) {
        setErrors(err.body.errors);
      } else {
        addToast(err.message || "Failed to save college.", "error");
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
            className="fixed left-1/2 top-1/2 z-[160] max-h-[88vh] w-[94%] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {isEdit ? "Edit College" : "Add College"}
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
              <Input
                id="code" label="College Code" value={form.code}
                onChange={(e) => update("code", e.target.value)}
                disabled={isEdit} required
              />
              <Input
                id="name" label="Name" value={form.name}
                onChange={(e) => update("name", e.target.value)} required
              />
              <Select
                id="district" label="District" value={form.district}
                onChange={(e) => update("district", e.target.value)}
                options={districts.map((d) => d.code)}
              />
              <Input
                id="place" label="Place" value={form.place}
                onChange={(e) => update("place", e.target.value)}
              />
              <Input
                id="university" label="University" value={form.university}
                onChange={(e) => update("university", e.target.value)}
              />
              <Input
                id="ownershipType" label="Ownership Type" value={form.ownershipType}
                onChange={(e) => update("ownershipType", e.target.value)}
                placeholder="e.g. Private, Government, University"
              />
              <Input
                id="website" label="Website" value={form.website}
                onChange={(e) => update("website", e.target.value)}
              />
              <Input
                id="phone" label="Phone" value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
              <Input
                id="email" label="Email" type="email" value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
              <Input
                id="address" label="Address" value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="sm:col-span-2"
              />

              <div className="flex flex-wrap gap-5 pt-1 sm:col-span-2">
                {[
                  ["isMinority", "Minority"],
                  ["isGirls", "Girls College"],
                  ["isSelfFinance", "Self Finance"],
                ].map(([field, label]) => (
                  <label key={field} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={form[field]}
                      onChange={(e) => update(field, e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create College"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}