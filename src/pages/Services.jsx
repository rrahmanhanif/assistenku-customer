// src/pages/Services.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { createOrder } from "../lib/order";
import { useNavigate } from "react-router-dom";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const customer_id = localStorage.getItem("customer_id");
  const customer_name = localStorage.getItem("customer_name");

  // ================================================
  // FETCH ALL ACTIVE SERVICES
  // ================================================
  async function loadServices() {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("category", { ascending: true });

    if (data) setServices(data);
  }

  useEffect(() => {
    loadServices();
  }, []);

  // ================================================
  // HANDLE ORDER CREATION
  // ================================================
  async function handleOrder(service) {
    if (loading) return;

    setLoading(true);

    try {
      const order = await createOrder({
        customer_id,
        customer_name,
        service_id: service.id,
        service_name: service.name,
        base_price: service.base_price,
        total_price: service.base_price, // default tanpa tambahan
      });

      if (!order) {
        alert("Gagal membuat pesanan.");
        setLoading(false);
        return;
      }

      // Redirect ke tracking
      navigate(`/track/${order.id}`);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pilih Layanan</h2>

      {services.length === 0 && <p>Memuat layanan...</p>}

      <div style={{ marginTop: "20px" }}>
        {services.map((srv) => (
          <div
            key={srv.id}
            style={{
              padding: "15px",
              marginBottom: "12px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              cursor: "pointer",
            }}
            onClick={() => handleOrder(srv)}
          >
            <h3 style={{ margin: 0 }}>{srv.name}</h3>
            <small>{srv.category}</small>
          </div>
        ))}
      </div>
    </div>
  );
              }
