import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";

// Eagerly load core home page for instant first paint
import Home from "./pages/Home";

// Lazily load exam portals & heavy tools on demand
const IcetHome = lazy(() => import("./pages/icet/IcetHome"));
const IcetPredictorPage = lazy(() => import("./pages/icet/IcetPredictorPage"));
const IcetMockCounsellingPage = lazy(() => import("./pages/icet/IcetMockCounsellingPage"));
const IcetComparePage = lazy(() => import("./pages/icet/IcetComparePage"));
const IcetDocumentsPage = lazy(() => import("./pages/icet/IcetDocumentsPage"));

const EapcetHome = lazy(() => import("./pages/eapcet/EapcetHome"));
const EapcetPredictorPage = lazy(() => import("./pages/eapcet/EapcetPredictorPage"));
const EapcetMockCounsellingPage = lazy(() => import("./pages/eapcet/EapcetMockCounsellingPage"));
const EapcetDocumentsPage = lazy(() => import("./pages/eapcet/EapcetDocumentsPage"));
const EapcetComparePage = lazy(() => import("./pages/eapcet/EapcetComparePage"));
const EapcetAllotmentsPage = lazy(() => import("./pages/eapcet/EapcetAllotmentsPage"));
const CollegeProfilePage = lazy(() => import("./pages/eapcet/CollegeProfilePage"));

const ApEapcetHome = lazy(() => import("./pages/ap-eapcet/EapcetHome"));
const ApEapcetPredictorPage = lazy(() => import("./pages/ap-eapcet/EapcetPredictorPage"));
const ApEapcetMockCounsellingPage = lazy(() => import("./pages/ap-eapcet/EapcetMockCounsellingPage"));
const ApEapcetDocumentsPage = lazy(() => import("./pages/ap-eapcet/EapcetDocumentsPage"));
const ApEapcetComparePage = lazy(() => import("./pages/ap-eapcet/EapcetComparePage"));
const ApEapcetAllotmentsPage = lazy(() => import("./pages/ap-eapcet/EapcetAllotmentsPage"));
const ApCollegeProfilePage = lazy(() => import("./pages/ap-eapcet/CollegeProfilePage"));

const EcetHome = lazy(() => import("./pages/ecet/EcetHome"));
const EcetPredictorPage = lazy(() => import("./pages/ecet/EcetPredictorPage"));
const EcetMockCounsellingPage = lazy(() => import("./pages/ecet/EcetMockCounsellingPage"));
const EcetAllotmentsPage = lazy(() => import("./pages/ecet/EcetAllotmentsPage"));
const EcetComparePage = lazy(() => import("./pages/ecet/EcetComparePage"));
const EcetDocumentsPage = lazy(() => import("./pages/ecet/EcetDocumentsPage"));

const PolycetHome = lazy(() => import("./pages/polycet/PolycetHome"));
const PolycetPredictorPage = lazy(() => import("./pages/polycet/PolycetPredictorPage"));
const PolycetMockCounsellingPage = lazy(() => import("./pages/polycet/PolycetMockCounsellingPage"));
const PolycetAllotmentsPage = lazy(() => import("./pages/polycet/PolycetAllotmentsPage"));
const PolycetComparePage = lazy(() => import("./pages/polycet/PolycetComparePage"));
const PolycetDocumentsPage = lazy(() => import("./pages/polycet/PolycetDocumentsPage"));

const PgecetHome = lazy(() => import("./pages/pgecet/PgecetHome"));
const PgecetAllotmentsPage = lazy(() => import("./pages/pgecet/PgecetAllotmentsPage"));
const PgecetPredictorPage = lazy(() => import("./pages/pgecet/PgecetPredictorPage"));
const PgecetComparePage = lazy(() => import("./pages/pgecet/PgecetComparePage"));
const PgecetDocumentsPage = lazy(() => import("./pages/pgecet/PgecetDocumentsPage"));

const ExamLandingPage = lazy(() => import("./pages/exams/ExamLandingPage"));
const ExamFeaturePage = lazy(() => import("./pages/exams/ExamFeaturePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const AdminApp = lazy(() => import("./admin/AdminApp"));

import ProtectedRoute from "./components/shared/ProtectedRoute";
import GoogleOneTap from "./components/shared/GoogleOneTap";
import LoginModal from "./components/shared/LoginModal";
import { useAuth } from "./context/AuthContext";
import { FloatingShareButton } from "./components/shared/ShareModal";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useAdSenseScript } from "./hooks/useAdSenseScript";

function PageLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-pulse">
      <div className="h-10 w-48 rounded-xl bg-white/5 mb-6" />
      <div className="h-64 rounded-3xl bg-white/5 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="h-28 rounded-2xl bg-white/5" />
        <div className="h-28 rounded-2xl bg-white/5" />
        <div className="h-28 rounded-2xl bg-white/5" />
        <div className="h-28 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

function GlobalAuthModal() {
  const { authModalOpen, closeAuthModal, authModalMode, handleAuthModalSuccess } = useAuth();
  return (
    <LoginModal
      open={authModalOpen}
      onClose={closeAuthModal}
      initialMode={authModalMode}
      onAuthenticated={handleAuthModalSuccess}
    />
  );
}

function MainContent() {
  const [openPanel, setOpenPanel] = useState(null);
  const location = useLocation();
  useAdSenseScript();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white">
      {/* Subtle fine noise overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      ></div>

      <div className="relative z-10 flex min-h-screen flex-col justify-between">
        <Navbar />

        <div className="relative z-20 flex-1">
          <Suspense fallback={<PageLoadingSkeleton />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <Routes location={location}>
                  <Route path="/" element={<Home />} />

                  {/* Exam Homepages */}
                  <Route path="/icet" element={<IcetHome />} />
                  <Route path="/tg-icet" element={<IcetHome />} />
                  <Route path="/exams/tg-icet" element={<IcetHome />} />

                  <Route path="/ap-eapcet" element={<ApEapcetHome />} />
                  <Route path="/exams/ap-eapcet" element={<ApEapcetHome />} />

                  <Route path="/eapcet" element={<EapcetHome />} />
                  <Route path="/tg-eapcet" element={<EapcetHome />} />
                  <Route path="/exams/tg-eapcet" element={<EapcetHome />} />

                  <Route path="/ecet" element={<EcetHome />} />
                  <Route path="/tg-ecet" element={<EcetHome />} />
                  <Route path="/exams/tg-ecet" element={<EcetHome />} />

                  <Route path="/polycet" element={<PolycetHome />} />
                  <Route path="/tg-polycet" element={<PolycetHome />} />
                  <Route path="/exams/tg-polycet" element={<PolycetHome />} />

                  {/* ICET Dedicated Pages */}
                  <Route path="/icet/predictor" element={<ProtectedRoute><IcetPredictorPage /></ProtectedRoute>} />
                  <Route path="/tg-icet/predictor" element={<ProtectedRoute><IcetPredictorPage /></ProtectedRoute>} />
                  <Route path="/exams/tg-icet/predictor" element={<ProtectedRoute><IcetPredictorPage /></ProtectedRoute>} />

                  <Route path="/icet/mock-counselling" element={<ProtectedRoute><IcetMockCounsellingPage /></ProtectedRoute>} />
                  <Route path="/tg-icet/mock-counselling" element={<ProtectedRoute><IcetMockCounsellingPage /></ProtectedRoute>} />
                  <Route path="/exams/tg-icet/mock-counselling" element={<ProtectedRoute><IcetMockCounsellingPage /></ProtectedRoute>} />

                  <Route path="/icet/compare" element={<IcetComparePage />} />
                  <Route path="/tg-icet/compare" element={<IcetComparePage />} />
                  <Route path="/exams/tg-icet/compare" element={<IcetComparePage />} />

                  <Route path="/icet/documents" element={<IcetDocumentsPage />} />
                  <Route path="/tg-icet/documents" element={<IcetDocumentsPage />} />
                  <Route path="/exams/tg-icet/documents" element={<IcetDocumentsPage />} />

                  {/* EAPCET Dedicated Pages */}
                  <Route path="/eapcet/predictor" element={<EapcetPredictorPage />} />
                  <Route path="/tg-eapcet/predictor" element={<EapcetPredictorPage />} />
                  <Route path="/exams/tg-eapcet/predictor" element={<EapcetPredictorPage />} />

                  <Route path="/ap-eapcet/predictor" element={<ApEapcetPredictorPage />} />
                  <Route path="/exams/ap-eapcet/predictor" element={<ApEapcetPredictorPage />} />

                  <Route path="/eapcet/mock-counselling" element={<EapcetMockCounsellingPage />} />
                  <Route path="/tg-eapcet/mock-counselling" element={<EapcetMockCounsellingPage />} />
                  <Route path="/exams/tg-eapcet/mock-counselling" element={<EapcetMockCounsellingPage />} />

                  <Route path="/ap-eapcet/mock-counselling" element={<ApEapcetMockCounsellingPage />} />
                  <Route path="/exams/ap-eapcet/mock-counselling" element={<ApEapcetMockCounsellingPage />} />

                  <Route path="/tg-eapcet/documents" element={<EapcetDocumentsPage />} />
                  <Route path="/ap-eapcet/documents" element={<ApEapcetDocumentsPage />} />
                  <Route path="/exams/ap-eapcet/documents" element={<ApEapcetDocumentsPage />} />

                  <Route path="/eapcet/compare" element={<EapcetComparePage />} />
                  <Route path="/tg-eapcet/compare" element={<EapcetComparePage />} />
                  <Route path="/exams/tg-eapcet/compare" element={<EapcetComparePage />} />

                  <Route path="/ap-eapcet/compare" element={<ApEapcetComparePage />} />
                  <Route path="/exams/ap-eapcet/compare" element={<ApEapcetComparePage />} />

                  <Route path="/tg-eapcet/allotments" element={<EapcetAllotmentsPage />} />
                  <Route path="/eapcet/allotments" element={<EapcetAllotmentsPage />} />

                  <Route path="/ap-eapcet/allotments" element={<ApEapcetAllotmentsPage />} />

                  <Route path="/colleges/:code" element={<CollegeProfilePage />} />
                  <Route path="/tg-eapcet/colleges/:code" element={<CollegeProfilePage />} />

                  <Route path="/ap-eapcet/colleges/:code" element={<ApCollegeProfilePage />} />

                  {/* ECET Dedicated Pages */}
                  <Route path="/ecet/predictor" element={<ProtectedRoute><EcetPredictorPage /></ProtectedRoute>} />
                  <Route path="/tg-ecet/predictor" element={<ProtectedRoute><EcetPredictorPage /></ProtectedRoute>} />
                  <Route path="/exams/tg-ecet/predictor" element={<ProtectedRoute><EcetPredictorPage /></ProtectedRoute>} />

                  <Route path="/ecet/mock-counselling" element={<ProtectedRoute><EcetMockCounsellingPage /></ProtectedRoute>} />
                  <Route path="/tg-ecet/mock-counselling" element={<ProtectedRoute><EcetMockCounsellingPage /></ProtectedRoute>} />
                  <Route path="/exams/tg-ecet/mock-counselling" element={<ProtectedRoute><EcetMockCounsellingPage /></ProtectedRoute>} />

                  <Route path="/ecet/compare" element={<EcetComparePage />} />
                  <Route path="/tg-ecet/compare" element={<EcetComparePage />} />
                  <Route path="/exams/tg-ecet/compare" element={<EcetComparePage />} />

                  <Route path="/ecet/documents" element={<EcetDocumentsPage />} />
                  <Route path="/tg-ecet/documents" element={<EcetDocumentsPage />} />
                  <Route path="/exams/tg-ecet/documents" element={<EcetDocumentsPage />} />

                  <Route path="/ecet/allotments" element={<EcetAllotmentsPage />} />
                  <Route path="/tg-ecet/allotments" element={<EcetAllotmentsPage />} />
                  <Route path="/exams/tg-ecet/allotments" element={<EcetAllotmentsPage />} />

                  {/* POLYCET Dedicated Pages */}
                  <Route path="/polycet/predictor" element={<ProtectedRoute><PolycetPredictorPage /></ProtectedRoute>} />
                  <Route path="/tg-polycet/predictor" element={<ProtectedRoute><PolycetPredictorPage /></ProtectedRoute>} />
                  <Route path="/exams/tg-polycet/predictor" element={<ProtectedRoute><PolycetPredictorPage /></ProtectedRoute>} />

                  <Route path="/polycet/mock-counselling" element={<ProtectedRoute><PolycetMockCounsellingPage /></ProtectedRoute>} />
                  <Route path="/tg-polycet/mock-counselling" element={<ProtectedRoute><PolycetMockCounsellingPage /></ProtectedRoute>} />
                  <Route path="/exams/tg-polycet/mock-counselling" element={<ProtectedRoute><PolycetMockCounsellingPage /></ProtectedRoute>} />

                  <Route path="/polycet/allotments" element={<PolycetAllotmentsPage />} />
                  <Route path="/tg-polycet/allotments" element={<PolycetAllotmentsPage />} />
                  <Route path="/exams/tg-polycet/allotments" element={<PolycetAllotmentsPage />} />

                  <Route path="/polycet/compare" element={<PolycetComparePage />} />
                  <Route path="/tg-polycet/compare" element={<PolycetComparePage />} />
                  <Route path="/exams/tg-polycet/compare" element={<PolycetComparePage />} />

                  <Route path="/polycet/documents" element={<PolycetDocumentsPage />} />
                  <Route path="/tg-polycet/documents" element={<PolycetDocumentsPage />} />
                  <Route path="/exams/tg-polycet/documents" element={<PolycetDocumentsPage />} />

                  {/* PGECET Dedicated Pages */}
                  <Route path="/pgecet" element={<PgecetHome />} />
                  <Route path="/tg-pgecet" element={<PgecetHome />} />
                  <Route path="/exams/tg-pgecet" element={<PgecetHome />} />

                  <Route path="/pgecet/allotments" element={<PgecetAllotmentsPage />} />
                  <Route path="/tg-pgecet/allotments" element={<PgecetAllotmentsPage />} />
                  <Route path="/pgecet/seat-allotments" element={<PgecetAllotmentsPage />} />
                  <Route path="/tg-pgecet/seat-allotments" element={<PgecetAllotmentsPage />} />
                  <Route path="/exams/tg-pgecet/allotments" element={<PgecetAllotmentsPage />} />

                  <Route path="/pgecet/predictor" element={<PgecetPredictorPage />} />
                  <Route path="/tg-pgecet/predictor" element={<PgecetPredictorPage />} />
                  <Route path="/pgecet/college-predictor" element={<PgecetPredictorPage />} />
                  <Route path="/tg-pgecet/college-predictor" element={<PgecetPredictorPage />} />
                  <Route path="/exams/tg-pgecet/predictor" element={<PgecetPredictorPage />} />

                  <Route path="/pgecet/compare" element={<PgecetComparePage />} />
                  <Route path="/tg-pgecet/compare" element={<PgecetComparePage />} />
                  <Route path="/exams/tg-pgecet/compare" element={<PgecetComparePage />} />

                  <Route path="/pgecet/documents" element={<PgecetDocumentsPage />} />
                  <Route path="/tg-pgecet/documents" element={<PgecetDocumentsPage />} />
                  <Route path="/exams/tg-pgecet/documents" element={<PgecetDocumentsPage />} />

                  {/* Fallbacks for other dynamic exam slugs */}
                  <Route path="/exams/:examSlug" element={<ExamLandingPage />} />
                  <Route path="/exams/:examSlug/predictor" element={<ExamFeaturePage feature="predictor" />} />
                  <Route path="/exams/:examSlug/mock-counselling" element={<ExamFeaturePage feature="counselling" />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </div>

        {/* Global Bottom-Left Floating Share Button on Every Page */}
        <FloatingShareButton />

        <Footer openPanel={openPanel} setOpenPanel={setOpenPanel} />
      </div>
    </div>
  );
}

function App() {
  useSmoothScroll();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <GoogleOneTap />
      <GlobalAuthModal />
      <Suspense fallback={<PageLoadingSkeleton />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/login" element={<LoginPage initialMode="login" />} />
          <Route path="/forgot-password" element={<LoginPage initialMode="forgot" />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="*" element={<MainContent />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
