// src/pages/Chat.jsx (CUSTOMER)
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getChat, sendChatMessage, subscribeChat } from "../lib/chat";
import { supabase } from "../lib/supabase";

export default function Chat() {
  const { orderId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const storageKey = useMemo(() => `chat_${orderId}_messages`, [orderId]);

  const customerId = localStorage.getItem("customer_id");

  // Load chat + realtime
  useEffect(() => {
    async function load() {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          setMessages(JSON.parse(cached));
        } catch {
          localStorage.removeItem(storageKey);
        }
      }

      const data = await getChat(orderId);
      setMessages(data);
      localStorage.setItem(storageKey, JSON.stringify(data));
    }

    load();

    const channel = subscribeChat(orderId, (msg) => {
      setMessages((prev) => {
        const exists = prev.some((item) => item.id === msg.id);
        const nextMessages = exists ? prev : [...prev, msg];
        localStorage.setItem(storageKey, JSON.stringify(nextMessages));
        return nextMessages;
      });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, storageKey]);

  async function handleSend() {
    if (!text.trim()) return;

    const sent = await sendChatMessage({
      order_id: orderId,
      sender: "customer",
      sender_id: customerId,
      message: text,
    });

    if (sent) {
      setMessages((prev) => {
        const exists = prev.some((item) => item.id === sent.id);
        const nextMessages = exists ? prev : [...prev, sent];
        localStorage.setItem(storageKey, JSON.stringify(nextMessages));
        return nextMessages;
      });
    }

    setText("");
  }

  function isCustomerMessage(m) {
    return m.sender === "customer" || m.sender_type === "customer";
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
        {messages.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Belum ada pesan.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              style={{
                marginBottom: 10,
                textAlign: isCustomerMessage(m) ? "right" : "left",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: 10,
                  background: isCustomerMessage(m) ? "#007bff" : "#555",
                  color: "white",
                  borderRadius: 8,
                  maxWidth: "70%",
                  wordBreak: "break-word",
                }}
              >
                {m.message}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik pesan..."
          style={{
            flex: 1,
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          onClick={handleSend}
          style={{
            background: "#16a34a",
            color: "white",
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Kirim
        </button>
      </div>
    </div>
  );
}
