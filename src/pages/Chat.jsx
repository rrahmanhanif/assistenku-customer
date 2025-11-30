import React, { useEffect, useState } from "react";
import { sendMessage, subscribeChat } from "../modules/chat";
import { useParams } from "react-router-dom";

export default function Chat() {
  const { orderId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const unsub = subscribeChat(orderId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => unsub.unsubscribe();
  }, []);

  const send = async () => {
    const sender = "customer";
    if (!text.trim()) return;

    await sendMessage(orderId, sender, text);
    setText("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Chat dengan Mitra</h3>
      <div style={{ marginBottom: 20 }}>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.sender}: </b> {m.message}
          </div>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tulis pesan..."
        style={{ width: "70%" }}
      />

      <button onClick={send}>Kirim</button>
    </div>
  );
}
