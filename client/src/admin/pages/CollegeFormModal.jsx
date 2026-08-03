import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, IndianRupee } from "lucide-react";
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
  offeredCourses: [],
};

export default function CollegeFormModal({ open, college, onClose, onSaved }) {
  const { addToast } = useToast();
  const { districts, courses } = useReferenceData();
  const isEdit = !!college;

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [offeredCoursesLoading, setOfferedCoursesLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    if (college) {
      setOfferedCoursesLoading(true);
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
        offeredCourses: [],
      });
      adminApi.get(`/admin/colleges/${college.id}`).then((details) => {
        if (cancelled) return;
        setForm((current) => ({
          ...current,
          offeredCourses: (details.offeredCourses ?? []).map((course) => ({
            courseId: course.courseId,
            fee: course.fee ?? "",
          })),
        }));
      }).catch((err) => {
        if (!cancelled) addToast(err.message || "Failed to load offered courses.", "error");
      }).finally(() => {
        if (!cancelled) setOfferedCoursesLoading(false);
      });
    } else {
      setOfferedCoursesLoading(false);
      setForm({ ...EMPTY_FORM, district: districts[0]?.code ?? "" });
    }
    setErrors([]);
    return () => { cancelled = true; };
  }, [open, college, districts, addToast]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleCourse(courseId) {
    setForm((current) => {
      const exists = current.offeredCourses.some((course) => course.courseId === courseId);
      return {
        ...current,
        offeredCourses: exists
          ? current.offeredCourses.filter((course) => course.courseId !== courseId)
          : [...current.offeredCourses, { courseId, fee: "" }],
      };
    });
  }

  function updateCourseFee(courseId, fee) {
    setForm((current) => ({
      ...current,
      offeredCourses: current.offeredCourses.map((course) => (
        course.courseId === courseId ? { ...course, fee } : course
      )),
    }));
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
            className="fixed left-1/2 top-1/2 z-[160] flex max-h-[calc(100dvh-2rem)] w-[94%] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-5 flex shrink-0 items-center justify-between px-6 pt-6">
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
              <div className="mx-6 mb-4 shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                <ul className="list-inside list-disc">
                  {errors.map((e) => <li key={e}>{e}</li>)}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto overscroll-contain px-6 pb-6 sm:grid-cols-2">
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

              <fieldset className="rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:col-span-2">
                <legend className="px-1 text-sm font-medium text-slate-900 dark:text-white">
                  Courses offered and fee
                </legend>
                <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                  {offeredCoursesLoading
                    ? "Loading this college’s offered courses…"
                    : "Select every course this college offers, then enter its individual annual fee. Fees may differ for MBA, MCA, MBT, and MTM."}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {courses.map((course) => {
                    const offeredCourse = form.offeredCourses.find((item) => item.courseId === course.id);
                    return (
                      <div key={course.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                          <input
                            type="checkbox"
                            checked={!!offeredCourse}
                            onChange={() => toggleCourse(course.id)}
                            disabled={offeredCoursesLoading}
                            className="h-4 w-4 rounded"
                          />
                          <span>{course.code}{course.name && course.name !== course.code ? ` — ${course.name}` : ""}</span>
                        </label>
                        <div className="relative w-32">
                          <IndianRupee size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            aria-label={`${course.code} fee`}
                            type="number"
                            min="0"
                            step="1"
                            value={offeredCourse?.fee ?? ""}
                            onChange={(e) => updateCourseFee(course.id, e.target.value)}
                            disabled={!offeredCourse || offeredCoursesLoading}
                            placeholder="Fee"
                            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-8 pr-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-800/50"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {courses.length === 0 && (
                  <p className="text-sm text-slate-500">No courses are configured yet. Add them from the Courses page first.</p>
                )}
              </fieldset>

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
