import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { generateDeviceId } from "../lib/device";

export default function Login() {
  const [name, setName] = useState("");

  async function handleLogin() {
    if (!name) return alert("Masukkan nama terlebih dahulu");

    // Generate device ID
    const deviceId = generateDeviceId();

    // Generate customer_id (sesuai sistem lama kamu)
    const customerId = Date.now().toString();

    // Simpan ke localStorage
    localStorage.setItem("customer_name", name);
    localStorage.setItem("customer_id", customerId);
    localStorage.setItem("device_id", deviceId);

    // Simpan ke Supabase (TABEL customers)
    await supabase
      .from("customers")
      .update({ device_id: deviceId })
      .eq("id", customerId);

    // Redirect
    window.location.href = "/";
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login Customer</h2>

      <input
        placeholder="Nama Anda"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: 10, width: "100%", marginBottom: 10 }}
      />

      <button
        onClick={handleLogin}
        style={{
          padding: 12,
          width: "100%",
          background: "#007bff",
          color: "white",
          borderRadius: 8,
        }}
      >
        Login
      </button>
    </div>
  );
}
