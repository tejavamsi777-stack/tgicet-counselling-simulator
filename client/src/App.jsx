import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import PredictorPage from "./pages/PredictorPage";
import MockCounsellingPage from "./pages/MockCounsellingPage";

function App() {
  const [openPanel, setOpenPanel] = useState(null);

  return (
    <BrowserRouter><div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
         <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl" />
<div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />
<div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        </div>

        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predictor" element={<PredictorPage />} />
          <Route path="/mock-counselling" element={<MockCounsellingPage />} />
        </Routes>

        <Footer openPanel={openPanel} setOpenPanel={setOpenPanel} />
      </div>
    </BrowserRouter>
  );
}

export default App;