import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { ToastProvider } from "./components/ToastContext";
import AdminRoute from "./routes/AdminRoute";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminLayout from "./layout/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import CollegesPage from "./pages/CollegesPage";
import LookupPage from "./pages/LookupPage";
import ImportPage from "./pages/ImportPage";
import SettingsPage from "./pages/SettingsPage";

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<AdminLoginPage />} />
          <Route
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="colleges" element={<CollegesPage />} />
            <Route
              path="courses"
              element={<LookupPage resource="courses" title="Courses" singularLabel="Course" />}
            />
            <Route
              path="districts"
              element={<LookupPage resource="districts" title="Districts" singularLabel="District" />}
            />
            <Route
              path="categories"
              element={<LookupPage resource="categories" title="Categories" singularLabel="Category" />}
            />
            <Route path="import" element={<ImportPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AdminAuthProvider>
  );
}