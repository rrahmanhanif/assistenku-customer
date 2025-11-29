"use client";
import { useEffect, useState } from "react";
import { subscribeOrder } from "@/lib/orderTracker";
import { getUserLocation } from "@/lib/getLocation";

export default function TrackOrder({ params }) {
  const orderId = params.id;
  const [order, setOrder] = useState(null);
  const [customerLoc, setCustomerLoc] = useState(null);

  useEffect(() => {
    const sub = subscribeOrder(orderId, (data) => setOrder(data));
    return () => supabase.removeChannel(sub);
  }, [orderId]);

  useEffect(() => {
    getUserLocation().then(loc => setCustomerLoc(loc));
  }, []);

  if (!order) return <div>Loading Tracking...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Tracking Pesanan #{orderId}</h1>

      <div className="mt-4 bg-gray-100 p-4 rounded-lg">
        <p>Status: <b>{order.status}</b></p>
        <p>Mitra: {order.mitra_name}</p>

        {order.mitra_lat && (
          <p>
            Lokasi Mitra: {order.mitra_lat}, {order.mitra_lng}
          </p>
        )}

        {customerLoc && (
          <p>
            Lokasi Anda: {customerLoc.lat}, {customerLoc.lng}
          </p>
        )}
      </div>
    </div>
  );
}
