// src/pages/Services.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { createOrder } from "../lib/order";

export default function Services() {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [duration, setDuration] = useState("1_jam");
  const [includeOvertime, setIncludeOvertime] = useState(false);

  const customer_id = localStorage.getItem("customer_id");
  const customer_name = localStorage.getItem("customer_name");
  const customer_address = localStorage.getItem("customer_address") || "";

  // ============================
  // AMBIL LIST LAYANAN
  // ============================
  async function loadServices() {
    const { data } = await supabase.from("services").select("*").eq("active", true);
    setServices(data || []);
  }

  useEffect(() => {
    loadServices();
  }, []);

  // ============================
  // HITUNG TOTAL HARGA
  // ============================
  function calculateTotal() {
    if (!selected) return 0;

    // fallback aman: beberapa skema layanan punya field berbeda-beda
    const base = selected.base_price ?? selected.price ?? 0;

    const durationPrice =
      {
        "1_jam": selected.base_price ?? base,
        "4_jam": selected.price_4h ?? base * 4,
        "6_jam": selected.price_6h ?? base * 6,
        "8_jam": selected.price_daily ?? base * 8,
        mingguan: selected.price_week ?? base * 7,
        bulanan: selected.price_month ?? base * 30,
        "1_tahun": selected.price_year ?? base * 365,
      }[duration] ?? base;

    const surge = selected.default_surge || 0;
    const overtime = includeOvertime ? selected.default_overtime : 0;

    return durationPrice + surge + overtime;
  }

  const totalPrice = calculateTotal();

  // ============================
  // SUBMIT ORDER
  // ============================
  async function handleOrder() {
    if (!selected) return;

    const order = await createOrder({
      customer_id,
      customer_name,
      customer_address,
      service_id: selected.id,
      service_name: selected.name,
      duration: duration,
      base_price: selected.base_price ?? selected.price ?? 0,
      total_price: totalPrice,
    });

    if (!order) {
      alert("Gagal membuat order");
      return;
    }

    // Konsisten dengan flow terbaru: OrderDetail -> Checkout -> Track
    window.location.href = `/order/${order.id}`;
  }

  // ============================
  // UI
  // ============================
  if (!selected) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Pilih Layanan</h2>

        {services.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelected(s)}
            style={{
              padding: 15,
              border: "1px solid #ccc",
              borderRadius: 10,
              marginBottom: 12,
              cursor: "pointer",
              background: "white",
            }}
          >
            <h3 style={{ margin: 0 }}>{s.name}</h3>
            {s.description && (
              <p style={{ marginTop: 8, marginBottom: 0, color: "#374151" }}>
                {s.description}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={() => setSelected(null)}
        style={{
          marginBottom: 12,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          background: "white",
          cursor: "pointer",
        }}
      >
        ← Kembali
      </button>

      <h2>{selected.name}</h2>

      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 8 }}>Durasi</label>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: "white",
          }}
        >
          <option value="1_jam">1 Jam</option>
          <option value="4_jam">4 Jam</option>
          <option value="6_jam">6 Jam</option>
          <option value="8_jam">Harian (8 Jam)</option>
          <option value="mingguan">Mingguan</option>
          <option value="bulanan">Bulanan</option>
          <option value="1_tahun">Tahunan</option>
        </select>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="checkbox"
          checked={includeOvertime}
          onChange={(e) => setIncludeOvertime(e.target.checked)}
        />
        Tambah lembur (default)
      </label>

      <div
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "white",
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          Total: Rp {totalPrice.toLocaleString("id-ID")}
        </h3>
        <p style={{ margin: 0, color: "#6b7280" }}>
          Total ini bersifat estimasi dan akan dikonfirmasi di checkout.
        </p>
      </div>

      <button
        onClick={handleOrder}
        style={{
          marginTop: 16,
          width: "100%",
          padding: 14,
          borderRadius: 10,
          border: "none",
          background: "#2563eb",
          color: "white",
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Buat Order
      </button>
    </div>
  );
}
