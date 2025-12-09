// src/pages/TrackOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import { subscribeOrderStatus, subscribeMitraLocation } from "../lib/orderRealtime";
import { subscribeOvertime } from "../lib/overtimeRealtime";
import { approveOvertime, rejectOvertime } from "../lib/overtime";

export default function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [statusText, setStatusText] = useState("Memuat...");

  // ========= FETCH ORDER AWAL =========
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

    // ========= REALTIME STATUS =========
    const subStatus = subscribeOrderStatus(orderId, (newData) => {
      setOrder(newData);
      setStatusText(newData.status);

      // AUTO REDIRECT SAAT SELESAI
      if (newData.status === "FINISHED") {
        alert("Pekerjaan selesai! Silakan beri rating.");
        navigate(`/rating/${orderId}`);
      }
    });

    return () => {
      supabase.removeChannel(subStatus);
    };
  }, []);

  // ========= REALTIME GPS MITRA =========
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

  // ========= REALTIME OVERTIME =========
  useEffect(() => {
    if (!orderId) return;

    const subOT = subscribeOvertime(orderId, async (req) => {
      if (req.status === "PENDING") {
        const agree = window.confirm(
          `Mitra mengajukan overtime ${req.requested_minutes} menit\n` +
          `Biaya tambahan: Rp ${req.total_price}\n\n` +
          `Setujui?`
        );

        if (agree) {
          await approveOvertime(req.id);
          alert("Overtime disetujui!");
        } else {
          await rejectOvertime(req.id);
          alert("Overtime ditolak.");
        }
      }
    });

    return () => supabase.removeChannel(subOT);
  }, [orderId]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Status Pesanan</h2>

      <h3>{statusText}</h3>

      {order?.mitra_lat && (
        <p>
          Mitra bergerak: {order.mitra_lat}, {order.mitra_lng}
        </p>
      )}

      {order?.overtime_minutes > 0 && (
        <p>
          <b>Overtime: </b>
          {order.overtime_minutes} menit (Rp {order.overtime_price})
        </p>
      )}
    </div>
  );
}
