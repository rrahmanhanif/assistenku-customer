"use client";

import { useEffect, useState } from "react";
import { sendMessage, subscribeChat } from "@/lib/chatCustomer";

export default function ChatPage({ params }) {
  const { orderId } = params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const sub = subscribeChat(orderId, (msg) =>
      setMessages((prev) => [...prev, msg])
    );
    return () => supabase.removeChannel(sub);
  }, [orderId]);

  const handleSend = async () => {
    await sendMessage(orderId, "customer", text);
    setText("");
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Chat Pesanan #{orderId}</h2>
      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="border rounded px-2 py-1">
            <b>{m.sender}:</b> {m.message}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          placeholder="Tulis pesan..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded"
          onClick={handleSend}
        >
          Kirim
        </button>
      </div>
    </div>
  );
}
