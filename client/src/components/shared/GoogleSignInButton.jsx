import { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

export default function GoogleSignInButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    if (!window.google || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const result = await loginWithGoogle(response.credential);

if (result.needsRegistration) {
  onSuccess?.(result);
  return;
}

onSuccess?.(result);
        } catch (err) {
          onError?.(err.message || "Google sign-in failed");
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
    });
  }, [loginWithGoogle, onSuccess, onError]);

  return <div ref={buttonRef} />;
}