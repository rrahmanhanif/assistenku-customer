// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { createOrder } from "../lib/order";

export default function Home() {
  const customer_id = localStorage.getItem("customer_id");
  const customer_name = localStorage.getItem("customer_name");
  const customer_address = localStorage.getItem("customer_address") || "";
  const navigate = useNavigate();

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

      setServices(data || []);
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
        service_name: service.name,
        customer_address,
        total_price: 0, // akan dihitung di halaman order detail / checkout
      });

      if (!newOrder) {
        setMessage("Gagal membuat pesanan.");
        setLoading(false);
        return;
      }

      navigate(`/order/${newOrder.id}`);
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

      {message && (
        <p style={{ color: "red", marginTop: 10, marginBottom: 10 }}>
          {message}
        </p>
      )}

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
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                marginBottom: 12,
                background: "white",
              }}
            >
              <h3 style={{ margin: 0 }}>{srv.name}</h3>

              {srv.description && (
                <p style={{ marginTop: 6, marginBottom: 6, color: "#374151" }}>
                  {srv.description}
                </p>
              )}

              <p style={{ marginTop: 6, marginBottom: 12 }}>
                <b>Harga:</b>{" "}
                Rp{" "}
                {(srv.price ?? 0).toLocaleString("id-ID")}
              </p>

              <button
                onClick={() => handleCreateOrder(srv)}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  cursor: "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Memproses..." : "Pesan Layanan Ini"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
