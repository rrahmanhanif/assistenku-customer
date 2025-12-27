import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setSent(false);
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  }

  return (
    <div className="flex h-screen justify-center items-center bg-blue-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl text-blue-600 mb-4 text-center">
          Reset Password
        </h2>

        <input
          type="email"
          placeholder="Email Anda"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded disabled:opacity-50"
        >
          {loading ? "Mengirim..." : "Kirim Link Reset"}
        </button>

        {error && (
          <p className="text-red-500 mt-4 text-center text-sm">{error}</p>
        )}

        {sent && (
          <p className="text-green-600 mt-4 text-center">
            Link reset telah dikirim!
          </p>
        )}
      </div>
    </div>
  );
}
