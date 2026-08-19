import React from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/shared/LoginModal";
import Home from "./Home";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function LoginPage({ initialMode = "login" }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || "/";

  // If already logged in, redirect
  if (!loading && user && !user.is_guest) {
    return <Navigate to={redirectTo} replace />;
  }

  function handleClose() {
    navigate(redirectTo, { replace: true });
  }

  function handleAuthenticated() {
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <div className="pt-24 pb-12">
        <Home />
      </div>
      <Footer />
      <LoginModal
        open={true}
        initialMode={initialMode}
        onClose={handleClose}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
}