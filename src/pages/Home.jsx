// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { createOrder } from "../lib/order";

export default function Home() {
  const customer_id = localStorage.getItem("customer_id");
  const customer_name = localStorage.getItem("customer_name");

  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState("");

  // ----------------------------------------
  // STEP 1 — Ambil layanan dari Supabase
  // ----------------------------------------
  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Gagal load services:", error);
        return;
      }
      setServices(data);
    }

    fetchServices();
  }, []);

  // ----------------------------------------
  // STEP 2 — Membuat pesanan dari layanan tertentu
  // ----------------------------------------
  async function handleCreateOrder(service) {
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
        service_id: service.id,
        total_price: 0, // akan dihitung di halaman order detail
      });

      if (!newOrder) {
        setMessage("Gagal membuat pesanan.");
        setLoading(false);
        return;
      }

      // Redirect ke halaman order detail
      window.location.href = `/order/${newOrder.id}`;
    } catch (err) {
      console.error("Error create order:", err);
      setMessage("Terjadi kesalahan.");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Selamat datang, {customer_name}</h2>
      <p>Pilih layanan yang ingin Anda pesan:</p>

      {/* ----------------------------------------
          LIST LAYANAN
      ---------------------------------------- */}
      {services.length === 0 ? (
        <p>Layanan sedang dimuat...</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {services.map((srv) => (
            <div
              key={srv.id}
              style={{
                padding: "15px",
                border: "1px solid #ddd",
                marginBottom: "12px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
              onClick={() => handleCreateOrder(srv)}
            >
              <h3 style={{ margin: 0 }}>{srv.name}</h3>
              <p style={{ margin: "5px 0", color: "#666" }}>
                {srv.short_description || "Layanan tersedia di wilayah Anda"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ----------------------------------------
          MESSAGE
      ---------------------------------------- */}
      {message && (
        <p style={{ marginTop: "15px", fontWeight: "bold" }}>{message}</p>
      )}
    </div>
  );
}
