// src/pages/Services.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { createOrder } from "../lib/order";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const customer_id = localStorage.getItem("customer_id");
  const customer_name = localStorage.getItem("customer_name");

  // ============================
  // FETCH SERVICES
  // ============================
  async function loadServices() {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("active", true);

    if (error) console.error(error);
    setServices(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadServices();
  }, []);

  // ============================
  // HANDLE SELECT SERVICE
  // ============================
  async function handleSelect(service) {
    const base = service.base_price || 0;
    const surge = service.default_surge || 0;
    const overtime = 0;

    const total = base + surge + overtime;

    const order = await createOrder({
      customer_id,
      customer_name,
      service_id: service.id,
      service_name: service.name,
      base_price: base,
      surge_price: surge,
      overtime_price: overtime,
      total_price: total,
    });

    if (order) {
      window.location.href = `/track/${order.id}`;
    } else {
      alert("Gagal membuat pesanan");
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Memuat layanan...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Pilih Layanan</h2>

      {services.map((s) => (
        <div
          key={s.id}
          onClick={() => handleSelect(s)}
          style={{
            padding: 15,
            marginBottom: 10,
            border: "1px solid #ddd",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          <h3>{s.name}</h3>
          <p>{s.description}</p>

          <strong>
            Harga Dasar: {s.base_price ? "Rp " + s.base_price.toLocaleString() : "-"}
          </strong>

          {s.default_surge > 0 && (
            <p>Surge: Rp {s.default_surge.toLocaleString()}</p>
          )}
        </div>
      ))}
    </div>
  );
}
