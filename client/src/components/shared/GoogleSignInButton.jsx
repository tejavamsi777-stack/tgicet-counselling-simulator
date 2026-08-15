import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function GoogleSignInButton({ onSuccess, onError, onStart }) {
  const buttonRef = useRef(null);
  const { loginWithGoogle } = useAuth();
  const [scriptLoaded, setScriptLoaded] = useState(() => Boolean(window.google?.accounts?.id));

  const callbacksRef = useRef({ onSuccess, onError, onStart });
  useEffect(() => {
    callbacksRef.current = { onSuccess, onError, onStart };
  });

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        setScriptLoaded(true);
        clearInterval(interval);
      }
    }, 100);

    const timeout = setTimeout(() => clearInterval(interval), 6000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !window.google?.accounts?.id) return;

    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "760845828261-cao5n5mthsd8jiqqll7q1jf4dr227dog.apps.googleusercontent.com";

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          callbacksRef.current.onStart?.();
          try {
            const result = await loginWithGoogle(response.credential);
            callbacksRef.current.onSuccess?.(result);
          } catch (err) {
            callbacksRef.current.onError?.(err.message || "Google sign-in failed");
          }
        },
      });

      // Clear any previous child before rendering
      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
      }

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "center",
      });
    } catch (e) {
      console.error("Google button render error:", e);
    }
  }, [scriptLoaded, loginWithGoogle]);

  return (
    <div className="flex min-h-[44px] w-full max-w-[320px] items-center justify-center">
      <div ref={buttonRef} className="w-full flex justify-center" />
    </div>
  );
}