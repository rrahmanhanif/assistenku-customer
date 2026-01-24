import React, { useCallback, useEffect, useState } from "react";
import { ensureSession } from "../auth/session";
import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";
import { formatApiError } from "../services/http/errors";
import ErrorBanner from "./ErrorBanner";

function extractRole(payload) {
  return (
    payload?.role ||
    payload?.data?.role ||
    payload?.user?.role ||
    payload?.data?.user?.role
  );
}

export default function CustomerGate({ children }) {
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);

  const validate = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setBlocked(false);

      await ensureSession();

      const whoami = await httpClient.get(endpoints.auth.whoami);
      const detectedRole = extractRole(whoami);

      setRole(detectedRole || null);

      if (detectedRole && detectedRole !== "CUSTOMER") {
        setBlocked(true);
      }
    } catch (err) {
      setError(formatApiError(err));
      setBlocked(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validate();
  }, [validate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Memverifikasi akun...
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
        <div className="bg-white shadow rounded-2xl p-6 max-w-md w-full space-y-3">
          <h2 className="text-lg font-semibold text-blue-700">Akses dibatasi</h2>

          <p className="text-sm text-gray-600">
            {role && role !== "CUSTOMER"
              ? `Akun Anda terdeteksi sebagai ${role}. Silakan login menggunakan akun CUSTOMER.`
              : "Kami tidak dapat memverifikasi akun Anda saat ini."}
          </p>

          {error && <ErrorBanner message={error} />}

          <button
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Kembali ke Login
          </button>

          <button
            className="w-full border border-blue-200 text-blue-600 py-2 rounded-lg"
            onClick={validate}
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
