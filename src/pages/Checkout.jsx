// src/pages/Checkout.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useParams } from "react-router-dom";

export default function Checkout() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [loading, setLoading] = useState(false);

  async function loadOrder() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    setOrder(data);
  }

  useEffect(() => {
    loadOrder();
  }, []);

  async function handlePay() {
    setLoading(true);

    // simulasi membuat kode pembayaran unik
    const reference = "INV-" + Math.floor(Math.random() * 9999999);

    const { error } = await supabase
      .from("orders")
      .update({
        payment_method: paymentMethod,
        payment_status: "PAID",
        payment_reference: reference,
        status: "MENUGGU_MITRA", // setelah bayar → order aktif
      })
      .eq("id", orderId);

    if (error) {
      alert("Gagal memproses pembayaran");
      setLoading(false);
      return;
    }

    alert("Pembayaran sukses!");
    window.location.href = `/track/${orderId}`;
  }

  if (!order) return <p>Memuat...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Checkout</h2>

      <div
        style={{
          padding: 15,
          marginBottom: 20,
          background: "#f1f1f1",
          borderRadius: 8,
        }}
      >
        <h3>{order.service_name}</h3>
        <p>Durasi: {order.duration}</p>
        <p>Total harga:</p>
        <strong style={{ fontSize: 24 }}>
          Rp {order.total_price.toLocaleString()}
        </strong>
      </div>

      <h3>Metode Pembayaran</h3>
      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        style={{ padding: 10, width: "100%", borderRadius: 10, marginBottom: 20 }}
      >
        <option value="qris">QRIS</option>
        <option value="va_bca">Virtual Account BCA</option>
        <option value="va_bri">Virtual Account BRI</option>
        <option value="va_mandiri">Virtual Account Mandiri</option>
        <option value="transfer_bank">Transfer Bank Manual</option>
        <option value="cod">Cash on Delivery</option>
      </select>

      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          padding: 15,
          width: "100%",
          borderRadius: 10,
          background: "#007bff",
          color: "white",
          fontSize: 18,
        }}
      >
        {loading ? "Memproses..." : "Bayar Sekarang"}
      </button>
    </div>
  );
        }
