// src/pages/Register.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { generateDeviceId } from "../lib/device";

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email || !password || !name) {
      setError("Semua field wajib diisi");
      setLoading(false);
      return;
    }

    // REGISTER SUPABASE AUTH
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpErr) {
      setError(signUpErr.message);
      setLoading(false);
      return;
    }

    if (!data?.user) {
      setError("Registrasi berhasil, cek email Anda untuk konfirmasi.");
      setLoading(false);
      return;
    }

    const userId = data.user.id;
    const deviceId = await generateDeviceId();

    // BUAT PROFILE CUSTOMER
    await supabase.from("profiles").insert({
      id: userId,
      name,
      email,
      device_id: deviceId,
    });

    localStorage.setItem("customer_id", userId);
    localStorage.setItem("customer_name", name);
    localStorage.setItem("device_id", deviceId);
    localStorage.setItem("customer_auth", "true");

    setLoading(false);
    setSuccess("Registrasi berhasil! Anda sudah login.");
    window.location.href = "/";
  }

  return (
    <div className="flex h-screen justify-center items-center bg-blue-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">
          Daftar Customer
        </h2>

        <input
          type="text"
          placeholder="Nama Lengkap"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        <input
          type="email"
          placeholder="Email Anda"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        <input
          type="password"
          placeholder="Password (min 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
        >
          {loading ? "Mendaftar..." : "Daftar"}
        </button>

        <p
          className="text-blue-600 text-center mt-4 cursor-pointer"
          onClick={() => (window.location.href = "/login")}
        >
          Sudah punya akun? Login
        </p>
      </form>
    </div>
  );
}
