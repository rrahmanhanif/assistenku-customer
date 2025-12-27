// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { createOrder } from "../lib/order";

export default function Home() {
  const customer_id = localStorage.getItem("customer_id");
  const customer_name = localStorage.getItem("customer_name");

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (fetchError) {
        console.error("Gagal load services:", fetchError);
        setError("Gagal memuat layanan. Coba lagi nanti.");
      }

      setServices(data || []);
      setLoading(false);
    }

    fetchServices();
  }, []);

  async function handleCreateOrder(service) {
    if (!customer_id || !customer_name) {
      setMessage("Login ulang diperlukan.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const newOrder = await createOrder({
        customer_id,
        customer_name,
        service_id: service.id,
        total_price: 0,
      });

      if (!newOrder) {
        setMessage("Gagal membuat pesanan.");
        setLoading(false);
        return;
      }

      window.location.href = `/order/${newOrder.id}`;
    } catch (err) {
      console.error("Error create order:", err);
      setMessage("Terjadi kesalahan.");
    }

    setLoading(false);
  }

  return (
    <div className="page-container space-y-4">
      <section>
        <p className="section-subtitle">
          Hai, {customer_name || "Customer"}
        </p>
        <h2 className="section-title">Pilih layanan terbaik untuk Anda</h2>
        <p className="section-subtitle">
          Temukan layanan kebersihan, perawatan, hingga kurir instan yang siap
          membantu.
        </p>
      </section>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="card skeleton">
              <div className="skeleton-line short" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada layanan aktif untuk wilayah Anda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="card service-card"
              onClick={() => handleCreateOrder(srv)}
            >
              <h3 className="section-title">{srv.name}</h3>
              <p className="section-subtitle">
                {srv.short_description ||
                  "Layanan tersedia di wilayah Anda"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
