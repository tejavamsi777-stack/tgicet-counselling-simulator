import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2, BookOpen, MapPin, Tags, FileSpreadsheet, Plus, Clock,
} from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import AdminStatCard from "../components/AdminStatCard";
import Card from "../../components/ui/Card";

const QUICK_ACTIONS = [
  { to: "/admin/colleges", label: "Add College", icon: Plus },
  { to: "/admin/import", label: "Import Excel", icon: FileSpreadsheet },
  { to: "/admin/courses", label: "Manage Courses", icon: BookOpen },
];

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-[104px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await adminApi.get("/admin/dashboard/stats");
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load dashboard stats.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Overview of your counselling data.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard label="Total Colleges" value={stats?.totalColleges ?? 0} icon={Building2} accent="brand" delay={0} />
          <AdminStatCard label="Total Courses" value={stats?.totalCourses ?? 0} icon={BookOpen} accent="emerald" delay={0.05} />
          <AdminStatCard label="Total Categories" value={stats?.totalCategories ?? 0} icon={Tags} accent="amber" delay={0.1} />
          <AdminStatCard label="Total Districts" value={stats?.totalDistricts ?? 0} icon={MapPin} accent="purple" delay={0.15} />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to}>
                <Card className="flex items-center gap-3 p-4 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{action.label}</span>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
        <Card className="divide-y divide-slate-100 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="p-5 text-sm text-slate-500 dark:text-slate-400">Loading…</div>
          ) : !stats?.recentActivity?.length ? (
            <div className="p-5 text-sm text-slate-500 dark:text-slate-400">No recent activity yet.</div>
          ) : (
            stats.recentActivity.map((item, i) => (
              <motion.div
                key={`${item.code}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-5 py-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <Clock size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-900 dark:text-white">
                    <span className="font-medium">{item.name}</span>{" "}
                    <span className="text-slate-500 dark:text-slate-400">
                      was {item.action}
                    </span>
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-slate-400">
                  {new Date(item.updated_at).toLocaleDateString()}
                </span>
              </motion.div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}