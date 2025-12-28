// src/pages/Checkout.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { createOrder } from "../lib/order";
import { normalize, validateEmail, validatePassword } from "../utils/validator";

export default function Checkout() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateEmail(email)) {
      alert("Email tidak valid");
      return;
    }

    if (!validatePassword(password)) {
      alert("Password minimal 8 karakter");
      return;
    }

    setLoading(true);

    try {
      await createOrder({
        service_id: serviceId,
        email: normalize(email),
      });

      navigate("/checkout-success");
    } catch (err) {
      alert("Gagal membuat pesanan");
    } finally {
      setLoading(false);
    }
  }

  if (!service) return <p>Memuat layanan...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h1>{service.name}</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button disabled={loading}>
        {loading ? "Memproses..." : "Pesan Sekarang"}
      </button>
    </form>
  );
}
