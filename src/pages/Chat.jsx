import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getChat, sendChatMessage, subscribeChat } from "../lib/chat";
import { supabase } from "../lib/supabase";

export default function Chat() {
  const { orderId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const senderId = localStorage.getItem("customer_id");

  // Load chat history
  useEffect(() => {
    async function load() {
      const data = await getChat(orderId);
      setMessages(data);
    }
    load();

    const channel = subscribeChat(orderId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => supabase.removeChannel(channel);
  }, []);

  async function handleSend() {
    if (!text.trim()) return;

    await sendChatMessage({
      order_id: orderId,
      sender_type: "customer",
      sender_id: senderId,
      message: text,
    });

    setText("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat dengan Mitra</h2>

      <div
        style={{
          height: "70vh",
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 10,
          marginTop: 15,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: 10,
              textAlign: m.sender_type === "customer" ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: 10,
                background:
                  m.sender_type === "customer" ? "#007bff" : "#cccccc",
                color: "white",
                borderRadius: 8,
              }}
            >
              {m.message}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik pesan..."
          style={{
            width: "75%",
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        />
        <button
          onClick={handleSend}
          style={{
            width: "20%",
            marginLeft: "5%",
            padding: 10,
            background: "#28a745",
            color: "white",
            borderRadius: 8,
          }}
        >
          Kirim
        </button>
      </div>
    </div>
  );
}
