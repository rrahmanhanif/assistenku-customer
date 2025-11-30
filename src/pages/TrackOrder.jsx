import React from "react";
import { useParams } from "react-router-dom";
import ChatRoom from "../components/ChatRoom";

export default function TrackOrder() {
  const { orderId } = useParams();
  const customerName = localStorage.getItem("customer_name");

  return (
    <div style={{ padding: 20 }}>
      <h1>Tracking Order #{orderId}</h1>

      {/* PETA DISINI (sudah ada dari G5) */}

      {/* CHAT */}
      <ChatRoom orderId={orderId} sender={customerName} />
    </div>
  );
}
