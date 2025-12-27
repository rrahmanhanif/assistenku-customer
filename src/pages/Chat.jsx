// src/pages/Chat.jsx (CUSTOMER)
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getChat, sendChatMessage, subscribeChat } from "../lib/chat";
import { supabase } from "../lib/supabase";

export default function Chat() {
  const { orderId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const customerId = localStorage.getItem("customer_id");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getChat(orderId);
        setMessages(data || []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat pesan.");
      }
      setLoading(false);
    }

    load();

    const channel = subscribeChat(orderId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  async function handleSend() {
    if (!text.trim()) return;

    await sendChatMessage({
      order_id: orderId,
      sender_type: "customer",
      sender_id: customerId,
      message: text,
    });

    setText("");
  }

  return (
    <div className="page-container space-y-4">
      <header>
        <h2 className="section-title">Chat dengan Mitra</h2>
        <p className="section-subtitle">
          Tetap terhubung dan pantau perkembangan pesanan Anda.
        </p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="space-y-3 card">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      ) : (
        <div className="card chat-box">
          {messages.length === 0 ? (
            <div className="empty-state">Belum ada percakapan</div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`message-row ${
                  m.sender_type === "customer" ? "me" : "them"
                }`}
              >
                <div
                  className={`message-bubble ${
                    m.sender_type === "customer" ? "me" : "them"
                  }`}
                >
                  {m.message}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="chat-input-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik pesan..."
          className="input-control"
        />
        <button className="btn-primary btn-send" onClick={handleSend}>
          Kirim
        </button>
      </div>
    </div>
  );
}
