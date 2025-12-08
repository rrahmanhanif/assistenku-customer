// src/pages/TrackOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { subscribeOrderStatus, subscribeMitraLocation } from "../lib/orderRealtime";

export default function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [statusText, setStatusText] = useState("Memuat...");

  // Fetch initial order
  async function loadOrder() {
    const { data } = await supabase
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

    // Subscribe to realtime order status
    const sub = subscribeOrderStatus(orderId, (newData) => {
      setOrder(newData);
      setStatusText(newData.status);

      // AUTO REDIRECT to rating
      if (newData.status === "FINISHED") {
        setTimeout(() => {
          navigate(`/rating/${orderId}`);
        }, 700); // delay halus
      }
    });

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  // Subscribe GPS jika mitra_id sudah ada
  useEffect(() => {
    if (!order?.mitra_id) return;

    const gpsSub = subscribeMitraLocation(order.mitra_id, (loc) => {
      setOrder((prev) => ({
        ...prev,
        mitra_lat: loc.lat,
        mitra_lng: loc.lng,
      }));
    });

    return () => supabase.removeChannel(gpsSub);
  }, [order?.mitra_id]);

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
