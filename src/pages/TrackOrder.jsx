// src/pages/TrackOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { subscribeOrderStatus } from "../lib/orderRealtime";
import { subscribeMitraLocation } from "../modules/liveLocation";

export default function TrackOrder() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [statusText, setStatusText] = useState("Memuat...");

  // Fetch order pertama kali
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

    // 🔵 1. Subscribe status order (realtime)
    const statusSub = subscribeOrderStatus(orderId, (newData) => {
      setOrder(newData);
      setStatusText(newData.status);
    });

    // 🔵 2. Subscribe GPS MITRA (jika mitra sudah assign)
    let gpsSub = null;
    let unsubscribe = () => {};

    const intervalCheck = setInterval(() => {
      if (order?.mitra_id && !gpsSub) {
        gpsSub = subscribeMitraLocation(order.mitra_id, (loc) => {
          setOrder((prev) => ({
            ...prev,
            mitra_lat: loc.lat,
            mitra_lng: loc.lng,
          }));
        });

        unsubscribe = () => supabase.removeChannel(gpsSub);
      }
    }, 1000);

    return () => {
      clearInterval(intervalCheck);
      supabase.removeChannel(statusSub);
      unsubscribe();
    };
  }, [order?.mitra_id]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Status Pesanan #{orderId}</h2>

      <h3>{statusText}</h3>

      {order?.mitra_lat && (
        <p>
          Lokasi mitra: {order.mitra_lat}, {order.mitra_lng}
        </p>
      )}
    </div>
  );
}
