import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import posthog from "posthog-js";
import { prefetchAllExams } from "./hooks/useReferenceData";

// Kick off all exam data fetches immediately — before React even renders.
// This warms the in-memory cache so predictor pages show data instantly.
prefetchAllExams();

// 2. Initialize PostHog only in production (prevents ERR_BLOCKED_BY_CLIENT in local dev/ad-blockers)
if (!import.meta.env.DEV && import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: true,
  });
}

// 3. Render once with AuthProvider wrapping the App
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      {!import.meta.env.DEV && <Analytics />}
    </AuthProvider>
  </React.StrictMode>
);