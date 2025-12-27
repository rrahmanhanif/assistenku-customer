import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function clearCustomerStorage() {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("customer_") || key === "device_id") {
      localStorage.removeItem(key);
    }
  });
}

export default function useAuthGuard() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("customer_auth") === "true"
  );
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const isAuthenticated =
        localStorage.getItem("customer_auth") === "true";

      if (!isAuthenticated) {
        if (!cancelled) {
          setLoggedIn(false);
          setChecking(false);
        }
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (!data?.session || error) {
        const { data: refreshed, error: refreshError } =
          await supabase.auth.refreshSession();

        if (refreshError || !refreshed?.session) {
          clearCustomerStorage();
          if (!cancelled) {
            setLoggedIn(false);
            setChecking(false);
          }
          return;
        }
      }

      if (!cancelled) {
        setLoggedIn(true);
        setChecking(false);
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, []);

  return { loggedIn, checking };
}
