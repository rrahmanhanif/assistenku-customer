// src/pages/Home.jsx
import React, { useState } from "react";
import { createOrder } from "../lib/orderService"; // FIX: file yg benar

export default function Home() {
  const customer_id = localStorage.getItem("customer_id");
  const customer_name = localStorage.getItem("customer_name");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCreateOrder() {
    if (!customer_id || !customer_name) {
      setMessage("Login ulang diperlukan.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const newOrder = await createOrder({
        customer_id,
        customer_name,
        total_price: 50000,
      });

      if (!newOrder) {
        setMessage("Gagal membuat pesanan.");
        setLoading(false);
        return;
      }

      setMessage("Pesanan berhasil dibuat! Order ID: " + newOrder.id);

      window.location.href = `/track/${newOrder.id}`;
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan.");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Selamat datang, {customer_name}</h2>

      <button
        onClick={handleCreateOrder}
        disabled={loading}
        style={{
          padding: "12px",
          width: "100%",
          fontSize: "16px",
          background: "#007bff",
          color: "white",
          borderRadius: "8px",
        }}
      >
        {loading ? "Memproses..." : "Buat Pesanan Baru"}
      </button>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </div>
  );
}
