// src/pages/Checkout.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { createOrder } from "../lib/order";

export default function Checkout() {
  const { serviceId } = useParams(); // ganti orderId → serviceId
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);

  const customerId = localStorage.getItem("customer_id");
  const customerName = localStorage.getItem("customer_name");

  // Ambil detail layanan
  useEffect(() => {
    async function loadService() {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (!error) setService(data);
    }
    loadService();
  }, [serviceId]);

  async function handleOrder() {
    if (!service) return;

    setLoading(true);

    const orderData = {
      customer_id: customerId,
      customer_name: customerName,
      service_id: service.id,
      service_name: service.name,
      base_price: service.price,
      total_price: service.price,
      status: "MENUNGGU_KONFIRMASI", // sesuai system Level 8
    };

    const created = await createOrder(orderData);
    setLoading(false);

    if (!created) {
      alert("Gagal membuat pesanan");
      return;
    }

    navigate(`/track/${created.id}`);
  }

  if (!service) return <p>Memuat...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Checkout Layanan</h2>

      <div
        style={{
          padding: 15,
          border: "1px solid #ccc",
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <p><b>Layanan:</b> {service.name}</p>
        <p><b>Harga:</b> Rp {service.price.toLocaleString("id-ID")}</p>
      </div>

      <button
        onClick={handleOrder}
        disabled={loading}
        style={{
          background: "#007bff",
          color: "white",
          padding: 15,
          width: "100%",
          borderRadius: 8,
          border: "none",
          fontSize: 16,
        }}
      >
        {loading ? "Memproses..." : "Pesan Sekarang"}
      </button>
    </div>
  );
}
