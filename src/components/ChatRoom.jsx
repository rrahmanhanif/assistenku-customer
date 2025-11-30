import React, { useEffect, useState, useRef } from "react";
import { sendMessage, subscribeChat } from "../lib/chatService";

export default function ChatRoom({ orderId, sender }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeChat(orderId, (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollBottom();
    });

    return () => unsub.unsubscribe();
  }, []);

  function scrollBottom() {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }

  async function handleSend() {
    if (!input.trim()) return;
    await sendMessage(orderId, sender, input);
    setInput("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat dengan Mitra</h2>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 10,
          height: "65vh",
          overflowY: "scroll",
          marginBottom: 10,
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              textAlign: m.sender === sender ? "right" : "left",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "8px 12px",
                background: m.sender === sender ? "#4caf50" : "#f0f0f0",
                color: m.sender === sender ? "white" : "black",
                borderRadius: 10,
              }}
            >
              {m.message}
            </div>
          </div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          style={{ flex: 1, padding: 10, borderRadius: 8 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan..."
        />
        <button
          style={{
            padding: "10px 15px",
            background: "#4caf50",
            color: "white",
            borderRadius: 8,
          }}
          onClick={handleSend}
        >
          Kirim
        </button>
      </div>
    </div>
  );
}
