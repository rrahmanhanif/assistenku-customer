// src/pages/Checkout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [service, setService] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [customerAddress, setCustomerAddress] = useState(
    localStorage.getItem("customer_address") || ""
  );
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      setError("");

      const { data, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) {
        console.error("Gagal memuat order", orderError);
        setError("Order tidak ditemukan atau gagal dimuat.");
        setLoading(false);
        return;
      }

      setOrder(data);
      setCustomerAddress(data.customer_address || "");
      setPaymentMethod(
        data.payment_method && data.payment_method !== "none"
          ? data.payment_method.toLowerCase()
          : "cod"
      );

      if (data.service_id) {
        const { data: serviceData, error: serviceError } = await supabase
          .from("services")
          .select("*")
          .eq("id", data.service_id)
          .single();

        if (!serviceError) setService(serviceData || null);
      }

      setLoading(false);
    }

    if (orderId) loadOrder();
  }, [orderId]);

  const cost = useMemo(() => {
    const base = order?.base_price ?? service?.price ?? 0;
    const surge = order?.surge_price || 0;
    const overtime = order?.overtime_price || 0;
    const subtotal = base + surge + overtime;

    const platformFee = order?.platform_fee ?? Math.round(subtotal * 0.05);
    const total = order?.total_price ?? subtotal + platformFee;

    return { base, surge, overtime, platformFee, total };
  }, [order, service]);

  async function handleConfirm() {
    if (!orderId || !order) return;

    setSubmitting(true);
    setError("");

    const updates = {
      total_price: cost.total,
      platform_fee: cost.platformFee,
      customer_address: customerAddress,
      payment_method: paymentMethod === "cod" ? "COD" : "TRANSFER",
      payment_status: paymentMethod === "cod" ? "COD" : "PENDING_PAYMENT",
    };

    const { error: updateError } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (updateError) {
      console.error("Gagal menyimpan transaksi", updateError);
      setError("Tidak dapat menyimpan transaksi. Coba lagi.");
      setSubmitting(false);
      return;
    }

    // optional: simpan alamat ke localStorage agar checkout berikutnya lebih cepat
    try {
      localStorage.setItem("customer_address", customerAddress || "");
    } catch {}

    navigate(`/track/${orderId}`);
  }

  if (loading) {
    return <p style={{ padding: 20 }}>Menyiapkan checkout...</p>;
  }

  if (error || !order) {
    return (
      <p style={{ padding: 20, color: "red" }}>
        {error || "Order tidak ditemukan."}
      </p>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Checkout</h2>

      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          marginBottom: 16,
        }}
      >
        <p style={{ margin: "6px 0" }}>
          <strong>Order ID:</strong> {orderId}
        </p>
        <p style={{ margin: "6px 0" }}>
          <strong>Layanan:</strong>{" "}
          {order.service_name || service?.name || order.service_id}
        </p>
        <p style={{ margin: "6px 0" }}>
          <strong>Status:</strong> {order.status}
        </p>
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          marginBottom: 16,
        }}
      >
        <h4>Alamat Pelanggan</h4>
        <textarea
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          placeholder="Tuliskan alamat lengkap anda"
          rows={3}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #d1d5db",
          }}
        />
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          marginBottom: 16,
        }}
      >
        <h4>Metode Pembayaran</h4>
        <label style={{ display: "block", marginBottom: 8 }}>
          <input
            type="radio"
            name="payment-method"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span style={{ marginLeft: 8 }}>Cash on Delivery (COD)</span>
        </label>

        <label style={{ display: "block" }}>
          <input
            type="radio"
            name="payment-method"
            value="transfer"
            checked={paymentMethod === "transfer"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span style={{ marginLeft: 8 }}>Transfer Bank</span>
        </label>
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          marginBottom: 16,
        }}
      >
        <h4>Ringkasan Biaya</h4>
        <p style={{ margin: "6px 0" }}>
          Harga dasar: Rp {cost.base.toLocaleString("id-ID")}
        </p>
        <p style={{ margin: "6px 0" }}>
          Surge: Rp {cost.surge.toLocaleString("id-ID")}
        </p>
        <p style={{ margin: "6px 0" }}>
          Lembur: Rp {cost.overtime.toLocaleString("id-ID")}
        </p>
        <p style={{ margin: "6px 0" }}>
          Platform fee: Rp {cost.platformFee.toLocaleString("id-ID")}
        </p>
        <hr />
        <h3>Total Bayar: Rp {cost.total.toLocaleString("id-ID")}</h3>
      </div>

      {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}

      <button
        onClick={handleConfirm}
        disabled={submitting}
        style={{
          width: "100%",
          padding: 16,
          background: "#16a34a",
          color: "white",
          border: "none",
          borderRadius: 10,
          fontSize: 16,
          cursor: "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Memproses..." : "Konfirmasi dan Bayar"}
      </button>
    </div>
  );
}
