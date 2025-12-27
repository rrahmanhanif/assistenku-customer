// src/pages/OrderDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (fetchError) {
        console.error("Gagal memuat order", fetchError);
        setError("Order tidak ditemukan atau gagal dimuat.");
        setOrder(null);
        setLoading(false);
        return;
      }

      setOrder(data || null);
      setLoading(false);
    }

    if (orderId) loadOrder();
  }, [orderId]);

  const cost = useMemo(() => {
    if (!order) {
      return { base: 0, surge: 0, overtime: 0, platformFee: 0, total: 0 };
    }

    const base = order.base_price || 0;
    const surge = order.surge_price || 0;
    const overtime = order.overtime_price || 0;

    const subtotal = base + surge + overtime;
    const platformFee = order.platform_fee ?? Math.round(subtotal * 0.05);
    const total = order.total_price ?? subtotal + platformFee;

    return { base, surge, overtime, platformFee, total };
  }, [order]);

  if (loading) {
    return <p style={{ padding: 20 }}>Memuat detail order...</p>;
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
      <h2>Detail Order</h2>

      <div
        style={{
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <p style={{ margin: "6px 0" }}>
          <strong>Order ID:</strong> {orderId}
        </p>
        <p style={{ margin: "6px 0" }}>
          <strong>Layanan:</strong> {order.service_name || order.service_id}
        </p>
        <p style={{ margin: "6px 0" }}>
          <strong>Status Order:</strong> {order.status}
        </p>
        <p style={{ margin: "6px 0" }}>
          <strong>Status Pembayaran:</strong>{" "}
          <span
            style={{
              color: order.payment_status === "PAID" ? "green" : "#eab308",
              fontWeight: 600,
            }}
          >
            {order.payment_status || "UNPAID"}
          </span>
        </p>
        <p style={{ margin: "6px 0" }}>
          <strong>Metode Pembayaran:</strong>{" "}
          {order.payment_method && order.payment_method !== "none"
            ? order.payment_method
            : "Belum dipilih"}
        </p>
        <p style={{ margin: "6px 0" }}>
          <strong>Alamat Pelanggan:</strong>{" "}
          {order.customer_address || "Belum diisi"}
        </p>
      </div>

      <div
        style={{
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <h4>Rincian Biaya</h4>
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
        <h3>Total: Rp {cost.total.toLocaleString("id-ID")}</h3>
      </div>

      <button
        onClick={() => navigate(`/checkout/${orderId}`)}
        style={{
          padding: 14,
          width: "100%",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 10,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Lanjut ke Checkout
      </button>
    </div>
  );
}
