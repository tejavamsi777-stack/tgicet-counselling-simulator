import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";

import Home from "./pages/Home";
import IcetHome from "./pages/icet/IcetHome";
import IcetPredictorPage from "./pages/icet/IcetPredictorPage";
import IcetMockCounsellingPage from "./pages/icet/IcetMockCounsellingPage";
import EapcetHome from "./pages/eapcet/EapcetHome";
import EapcetPredictorPage from "./pages/eapcet/EapcetPredictorPage";
import EapcetMockCounsellingPage from "./pages/eapcet/EapcetMockCounsellingPage";
import EcetHome from "./pages/ecet/EcetHome";
import EcetPredictorPage from "./pages/ecet/EcetPredictorPage";
import EcetMockCounsellingPage from "./pages/ecet/EcetMockCounsellingPage";
import PolycetHome from "./pages/polycet/PolycetHome";
import PolycetPredictorPage from "./pages/polycet/PolycetPredictorPage";
import PolycetMockCounsellingPage from "./pages/polycet/PolycetMockCounsellingPage";
import ExamLandingPage from "./pages/exams/ExamLandingPage";
import ExamFeaturePage from "./pages/exams/ExamFeaturePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminApp from "./admin/AdminApp";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import { useSmoothScroll } from "./hooks/useSmoothScroll";

function MainContent() {
  const [openPanel, setOpenPanel] = useState(null);
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-purple-500 selection:text-white">
      {/* Gradient background with grain effect matching hero-2-1 */}
      <div className="pointer-events-none absolute -right-60 -top-10 z-0 flex flex-col items-end blur-xl">
        <div className="z-1 h-[10rem] w-[60rem] rounded-full bg-gradient-to-b from-purple-600 to-sky-600 blur-[6rem]"></div>
        <div className="z-1 h-[10rem] w-[90rem] rounded-full bg-gradient-to-b from-pink-900 to-yellow-400 blur-[6rem]"></div>
        <div className="z-1 h-[10rem] w-[60rem] rounded-full bg-gradient-to-b from-yellow-600 to-sky-500 blur-[6rem]"></div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      ></div>

      <div className="relative z-10 flex min-h-screen flex-col justify-between">
        <Navbar />

        <div className="flex-1">
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

                {/* EAPCET Dedicated Pages */}
                <Route path="/eapcet/predictor" element={<EapcetPredictorPage />} />
                <Route path="/tg-eapcet/predictor" element={<EapcetPredictorPage />} />
                <Route path="/exams/tg-eapcet/predictor" element={<EapcetPredictorPage />} />

                <Route path="/eapcet/mock-counselling" element={<EapcetMockCounsellingPage />} />
                <Route path="/tg-eapcet/mock-counselling" element={<EapcetMockCounsellingPage />} />
                <Route path="/exams/tg-eapcet/mock-counselling" element={<EapcetMockCounsellingPage />} />

                {/* ECET Dedicated Pages */}
                <Route path="/ecet/predictor" element={<ProtectedRoute><EcetPredictorPage /></ProtectedRoute>} />
                <Route path="/tg-ecet/predictor" element={<ProtectedRoute><EcetPredictorPage /></ProtectedRoute>} />
                <Route path="/exams/tg-ecet/predictor" element={<ProtectedRoute><EcetPredictorPage /></ProtectedRoute>} />

                <Route path="/ecet/mock-counselling" element={<ProtectedRoute><EcetMockCounsellingPage /></ProtectedRoute>} />
                <Route path="/tg-ecet/mock-counselling" element={<ProtectedRoute><EcetMockCounsellingPage /></ProtectedRoute>} />
                <Route path="/exams/tg-ecet/mock-counselling" element={<ProtectedRoute><EcetMockCounsellingPage /></ProtectedRoute>} />

                {/* POLYCET Dedicated Pages */}
                <Route path="/polycet/predictor" element={<ProtectedRoute><PolycetPredictorPage /></ProtectedRoute>} />
                <Route path="/tg-polycet/predictor" element={<ProtectedRoute><PolycetPredictorPage /></ProtectedRoute>} />
                <Route path="/exams/tg-polycet/predictor" element={<ProtectedRoute><PolycetPredictorPage /></ProtectedRoute>} />

                <Route path="/polycet/mock-counselling" element={<ProtectedRoute><PolycetMockCounsellingPage /></ProtectedRoute>} />
                <Route path="/tg-polycet/mock-counselling" element={<ProtectedRoute><PolycetMockCounsellingPage /></ProtectedRoute>} />
                <Route path="/exams/tg-polycet/mock-counselling" element={<ProtectedRoute><PolycetMockCounsellingPage /></ProtectedRoute>} />

                {/* Fallbacks for other dynamic exam slugs */}
                <Route path="/exams/:examSlug" element={<ExamLandingPage />} />
                <Route path="/exams/:examSlug/predictor" element={<ExamFeaturePage feature="predictor" />} />
                <Route path="/exams/:examSlug/mock-counselling" element={<ExamFeaturePage feature="counselling" />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>

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
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="*" element={<MainContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
