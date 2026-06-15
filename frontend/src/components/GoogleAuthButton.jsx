import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import useAuthStore from "../store/authStore";

const GOOGLE_SCRIPT_ID = "google-identity-services";

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function GoogleAuthButton({ label = "Continue with Google", onSuccess }) {
  const buttonRef = useRef(null);
  const { login } = useAuthStore();
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    let isMounted = true;

    loadGoogleScript()
      .then(() => {
        if (!isMounted || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              const res = await API.post("/auth/google", {
                credential: response.credential,
              });
              login(res.data.user, res.data.token);
              toast.success(res.data.message || "Google sign-in successful");
              onSuccess?.();
            } catch (err) {
              toast.error(err.response?.data?.message || "Google sign-in failed");
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: buttonRef.current.offsetWidth || 320,
          text: "continue_with",
        });
        setReady(true);
      })
      .catch(() => toast.error("Could not load Google sign-in"));

    return () => {
      isMounted = false;
    };
  }, [clientId, login, onSuccess]);

  if (!clientId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-semibold text-amber-700">
        Google sign-in needs VITE_GOOGLE_CLIENT_ID
      </div>
    );
  }

  return (
    <div>
      <div ref={buttonRef} className="flex min-h-[44px] justify-center" aria-label={label} />
      {!ready && (
        <div className="mt-2 text-center text-xs text-gray-400">Loading Google sign-in...</div>
      )}
    </div>
  );
}

export default GoogleAuthButton;
