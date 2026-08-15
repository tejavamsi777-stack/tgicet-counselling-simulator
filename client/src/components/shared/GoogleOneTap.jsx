import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function GoogleOneTap() {
  const { user, loading, loginWithGoogle } = useAuth();

  useEffect(() => {
    // Only prompt when the user is NOT logged in and initial auth check has completed
    if (loading || user) return;

    let checkInterval = null;
    let timeoutId = null;

    function initOneTap() {
      if (!window.google?.accounts?.id) return false;

      const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        "760845828261-cao5n5mthsd8jiqqll7q1jf4dr227dog.apps.googleusercontent.com";

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response?.credential) {
              try {
                await loginWithGoogle(response.credential);
              } catch (err) {
                console.error("Google One Tap sign in failed:", err);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          itp_support: true,
        });

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log("One Tap not displayed reason:", notification.getNotDisplayedReason());
          }
        });

        return true;
      } catch (err) {
        console.error("Error initializing Google One Tap:", err);
        return false;
      }
    }

    if (!initOneTap()) {
      checkInterval = setInterval(() => {
        if (initOneTap()) {
          clearInterval(checkInterval);
        }
      }, 300);

      timeoutId = setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);
      }, 5000);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (timeoutId) clearTimeout(timeoutId);
      try {
        window.google?.accounts?.id?.cancel();
      } catch {
        // ignore
      }
    };
  }, [user, loading, loginWithGoogle]);

  return null;
}
