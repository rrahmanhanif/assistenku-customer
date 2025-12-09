// src/pages/Login.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { generateDeviceId } from "../lib/device";
import { saveCustomerToFirebase } from "../lib/firebaseSync";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // LOGIN via Supabase Auth
    const { data, error: loginErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginErr) {
      setError(loginErr.message);
      setLoading(false);
      return;
    }

    const userId = data.user.id;
    const deviceId = await generateDeviceId();

    // UPDATE DEVICE CUSTOMER (Supabase)
    await supabase
      .from("profiles")
      .update({ device_id: deviceId })
      .eq("id", userId);

    // SAVE TO FIREBASE (OTAK)
    await saveCustomerToFirebase(userId, {
      email,
      device_id: deviceId,
      last_login: Date.now(),
    });

    // LOCAL STORAGE
    localStorage.setItem("customer_id", userId);
    localStorage.setItem("customer_email", email);
    localStorage.setItem("customer_name", data.user.email.split("@")[0]);
    localStorage.setItem("device_id", deviceId);
    localStorage.setItem("customer_auth", "true");

    window.location.href = "/";
  }

  return (
    <div className="flex h-screen justify-center items-center bg-blue-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">
          Login Customer
        </h2>

        <input
          type="email"
          placeholder="Email Anda"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
          required
        />

        <input
          type="password"
          placeholder="Kata Sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          required
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>

        <p
          className="text-blue-600 text-center mt-4 cursor-pointer"
          onClick={() => (window.location.href = "/forgot-password")}
        >
          Lupa Password?
        </p>

        <p
          className="text-blue-600 text-center mt-2 cursor-pointer"
          onClick={() => (window.location.href = "/register")}
        >
          Belum punya akun? Daftar
        </p>
      </form>
    </div>
  );
}
