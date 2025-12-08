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

  // ============================
  // AMBIL LIST LAYANAN
  // ============================
  async function loadServices() {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("active", true);

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

    let base = selected.base_price;

    // Durasi
    const durationPrice = {
      "1_jam": selected.price_hour,
      "4_jam": selected.price_4h,
      "8_jam": selected.price_day,
      "1_minggu": selected.price_week,
      "1_bulan": selected.price_month,
      "1_tahun": selected.price_year,
    }[duration] || selected.base_price;

    let surge = selected.default_surge || 0;
    let overtime = includeOvertime ? selected.default_overtime : 0;

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
      service_id: selected.id,
      service_name: selected.name,
      duration: duration,
      base_price: selected.base_price,
      total_price: totalPrice,
    });

    if (!order) {
      alert("Gagal membuat order");
      return;
    }

    window.location.href = `/track/${order.id}`;
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
              marginBottom: 10,
              cursor: "pointer",
            }}
          >
            <h3>{s.name}</h3>
            <p>{s.description}</p>
            <strong>Mulai dari Rp {s.base_price.toLocaleString()}</strong>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>

      <h2>{selected.name}</h2>
      <p>{selected.description}</p>

      {/* Durasi */}
      <h3>Pilih Durasi</h3>
      <select
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        style={{ padding: 10, borderRadius: 8, width: "100%", marginBottom: 20 }}
      >
        <option value="1_jam">1 Jam</option>
        <option value="4_jam">4 Jam</option>
        <option value="8_jam">8 Jam (Harian)</option>
        <option value="1_minggu">Mingguan</option>
        <option value="1_bulan">Bulanan</option>
        <option value="1_tahun">Tahunan</option>
      </select>

      {/* Lembur */}
      <label style={{ display: "block", marginBottom: 20 }}>
        <input
          type="checkbox"
          checked={includeOvertime}
          onChange={() => setIncludeOvertime(!includeOvertime)}
        />
        &nbsp; Tambah lembur
      </label>

      <h3>Total Harga</h3>
      <div
        style={{
          padding: 15,
          background: "#eee",
          borderRadius: 10,
          marginBottom: 20,
          fontSize: "20px",
        }}
      >
        Rp {totalPrice.toLocaleString()}
      </div>

      <button
        onClick={handleOrder}
        style={{
          padding: 15,
          width: "100%",
          background: "#007bff",
          color: "white",
          fontSize: "18px",
          borderRadius: 10,
        }}
      >
        Pesan Sekarang
      </button>

      <button
        onClick={() => setSelected(null)}
        style={{
          padding: 10,
          marginTop: 10,
          width: "100%",
          borderRadius: 10,
        }}
      >
        Kembali
      </button>
    </div>
  );
        }
