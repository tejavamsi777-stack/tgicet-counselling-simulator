import { useState } from "react";
import { KeyRound, UserCircle } from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useToast } from "../components/ToastContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

export default function SettingsPage() {
  const { admin } = useAdminAuth();
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    setErrors([]);

    if (newPassword.length < 8) {
      setErrors(["New password must be at least 8 characters"]);
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors(["New password and confirmation do not match"]);
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.patch("/admin/auth/password", { currentPassword, newPassword });
      addToast("Password updated successfully.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err.body?.errors) {
        setErrors(err.body.errors);
      } else {
        setErrors([err.message || "Failed to update password."]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your admin profile and account security.
        </p>
      </div>

      <Card className="p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <UserCircle size={20} />
          </div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Profile</h2>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Name</span>
            <span className="font-medium text-slate-900 dark:text-white">{admin?.name || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Email</span>
            <span className="font-medium text-slate-900 dark:text-white">{admin?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Role</span>
            <Badge tone="brand">{admin?.role}</Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <KeyRound size={20} />
          </div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          {errors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              <ul className="list-inside list-disc">
                {errors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}

          <Input
            id="currentPassword" label="Current Password" type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            id="newPassword" label="New Password" type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            id="confirmPassword" label="Confirm New Password" type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Updating…" : "Update Password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}