// src/pages/OrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { createOrder } from "../lib/order";

export default function OrderDetail() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  // Input customer
  const [duration, setDuration] = useState("1_jam");
  const [surge, setSurge] = useState(0);
  const [overtime, setOvertime] = useState(0);

  // Perhitungan
  const [total, setTotal] = useState(0);

  // ------------------------------------------
  // STEP 1 — AMBIL ORDER + LAYANAN
  // ------------------------------------------
  useEffect(() => {
    async function loadOrder() {
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (!orderData) return;

      setOrder(orderData);

      const { data: serviceData } = await supabase
        .from("services")
        .select("*")
        .eq("id", orderData.service_id)
        .single();

      setService(serviceData);
      setLoading(false);
    }

    loadOrder();
  }, [orderId]);

  // ------------------------------------------
  // STEP 2 — HITUNG TOTAL
  // ------------------------------------------
  useEffect(() => {
    if (!service) return;

    let hargaDasar = service.base_price_hour;

    switch (duration) {
      case "4_jam":
        hargaDasar = service.base_price_hour * 4;
        break;
      case "6_jam":
        hargaDasar = service.base_price_hour * 6;
        break;
      case "8_jam":
        hargaDasar = service.base_price_daily;
        break;
      case "mingguan":
        hargaDasar = service.base_price_week;
        break;
      case "bulanan":
        hargaDasar = service.base_price_month;
        break;
      case "tahunan":
        hargaDasar = service.base_price_year;
        break;
      default:
        hargaDasar = service.base_price_hour;
    }

    const surgeFee = (hargaDasar * surge) / 100;
    const overtimeFee = (service.base_price_hour * overtime) || 0;

    const subTotal = hargaDasar + surgeFee + overtimeFee;

    // Pajak + Fee
    const tax = subTotal * 0.005;
    const gateway = subTotal * 0.02;
    const customerFee = subTotal * 0.025;

    const finalPrice = Math.ceil(subTotal + tax + gateway + customerFee);

    setTotal(finalPrice);
  }, [duration, surge, overtime, service]);

  // ------------------------------------------
  // STEP 3 — LANJUTKAN PESANAN
  // ------------------------------------------
  async function handleConfirm() {
    if (!order) return;

    const update = {
      duration,
      surge,
      overtime,
      total_price: total,
      status: "waiting_partner",
    };

    const { error } = await supabase
      .from("orders")
      .update(update)
      .eq("id", orderId);

    if (!error) {
      window.location.href = `/track/${orderId}`;
    }
  }

  if (loading)
    return <p style={{ padding: 20 }}>Memuat data layanan...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Detail Layanan</h2>
      <h3>{service.name}</h3>

      {/* STATUS PEMBAYARAN */}
      <p>
        Status Pembayaran:
        <b style={{ color: order.payment_status === "PAID" ? "green" : "red" }}>
          {order.payment_status}
        </b>
      </p>

      {order.payment_method !== "none" && (
        <p>Metode Pembayaran: <b>{order.payment_method}</b></p>
      )}

      {/* DURASI */}
      <label>Durasi:</label>
      <select
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 10 }}
      >
        <option value="1_jam">1 Jam</option>
        <option value="4_jam">4 Jam</option>
        <option value="6_jam">6 Jam</option>
        <option value="8_jam">Harian (8 Jam)</option>
        <option value="mingguan">Mingguan</option>
        <option value="bulanan">Bulanan</option>
        <option value="tahunan">Tahunan (Kontrak)</option>
      </select>

      {/* SURGE */}
      <label style={{ marginTop: 20 }}>Surge (%):</label>
      <input
        type="number"
        value={surge}
        min="0"
        max="50"
        onChange={(e) => setSurge(parseInt(e.target.value))}
        style={{ width: "100%", padding: 10, marginTop: 10 }}
      />

      {/* LEMBUR */}
      <label style={{ marginTop: 20 }}>Lembur (jam):</label>
      <input
        type="number"
        value={overtime}
        min="0"
        max="12"
        onChange={(e) => setOvertime(parseInt(e.target.value))}
        style={{ width: "100%", padding: 10, marginTop: 10 }}
      />

      {/* TOTAL */}
      <h3 style={{ marginTop: 25 }}>Total: Rp {total.toLocaleString()}</h3>

      <button
        onClick={handleConfirm}
        style={{
          padding: 15,
          width: "100%",
          background: "#007bff",
          color: "white",
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        Konfirmasi Pesanan
      </button>
    </div>
  );
      }
