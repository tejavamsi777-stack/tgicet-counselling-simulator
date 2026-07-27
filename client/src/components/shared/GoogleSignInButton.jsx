import { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

export default function GoogleSignInButton({ onSuccess, onError, onStart }) {
  const buttonRef = useRef(null);
  const { loginWithGoogle } = useAuth();

  // Keep latest callbacks in refs so the init effect below doesn't need
  // them as dependencies (they're new function instances on every parent
  // render, which was causing renderButton() to re-run on every keystroke).
  const callbacksRef = useRef({ onSuccess, onError, onStart });
  useEffect(() => {
    callbacksRef.current = { onSuccess, onError, onStart };
  });

  useEffect(() => {
    if (!window.google || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
      logo_alignment: "center",
    });
    // Only initialize once on mount — see callbacksRef above for why.
  }, [loginWithGoogle]);

  return <div ref={buttonRef} />;
}