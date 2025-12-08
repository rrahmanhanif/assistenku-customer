// src/pages/TrackOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { subscribeOrderStatus } from "../lib/orderRealtime";

export default function TrackOrder() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [statusText, setStatusText] = useState("Memuat...");

  // Fetch initial order
  async function loadOrder() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (data) {
      setOrder(data);
      setStatusText(data.status);
    }
  }

  useEffect(() => {
    loadOrder();

    const sub = subscribeOrderStatus(orderId, (newData) => {
      setOrder(newData);
      setStatusText(newData.status);
    });

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Status Pesanan</h2>

      <h3>{statusText}</h3>

      {order?.mitra_lat && (
        <p>Mitra bergerak: {order.mitra_lat}, {order.mitra_lng}</p>
      )}
    </div>
  );
}
