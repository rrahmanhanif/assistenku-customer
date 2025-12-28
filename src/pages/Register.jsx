// src/pages/Register.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { generateDeviceId, obfuscateDeviceId } from "../lib/device";
import {
  normalize,
  validateEmail,
  validateName,
  validatePassword,
} from "../utils/validator";

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validateInput() {
    if (!validateName(name)) {
      return "Nama minimal 2 huruf dan tidak boleh mengandung simbol.";
    }

    if (!validateEmail(normalize(email))) {
      return "Format email tidak valid.";
    }

    if (!validatePassword(password)) {
      return "Password minimal 6 karakter.";
    }

    return "";
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validationMessage = validateInput();
    if (validationMessage) {
      setError(validationMessage);
      setLoading(false);
      return;
    }

    try {
      const normalizedEmail = normalize(email);
      const normalizedName = normalize(name);

      // REGISTER SUPABASE AUTH
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });

      if (signUpErr) {
        throw new Error(signUpErr.message || "Registrasi gagal.");
      }

      const userId = data?.user?.id;
      if (!userId) {
        throw new Error("Registrasi berhasil, tetapi user ID tidak ditemukan.");
      }

      // DEVICE ID
      const deviceId = await generateDeviceId(); // hashed device id
      const obfuscatedDeviceId = obfuscateDeviceId(deviceId);

      // BUAT PROFILE CUSTOMER
      const { error: profileErr } = await supabase.from("profiles").insert({
        id: userId,
        name: normalizedName,
        email: normalizedEmail,
        device_id: deviceId, // simpan mentah (hash) untuk validasi server
      });

      if (profileErr) {
        console.error(profileErr);
        throw new Error(
          "Gagal menyimpan profil. Silakan coba lagi atau hubungi dukungan."
        );
      }

      // LOCAL STORAGE
      localStorage.setItem("customer_id", userId);
      localStorage.setItem("customer_name", normalizedName);
      localStorage.setItem("customer_email", normalizedEmail);
      localStorage.setItem("device_id", obfuscatedDeviceId);
      localStorage.setItem("customer_auth", "true");

      alert("Registrasi berhasil! Anda sudah login.");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError(err?.message || "Terjadi kesalahan saat registrasi.");
    } finally {
      setLoading(false);
    }
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
          required
        />

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
          placeholder="Password (min. 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
          required
        />

        {error && (
          <p className="text-red-600 text-sm mb-3" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full p-2 rounded font-semibold disabled:opacity-70"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>
    </div>
  );
}
