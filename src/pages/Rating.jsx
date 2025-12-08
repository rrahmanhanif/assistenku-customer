// src/pages/Rating.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { sendRating } from "../lib/rating";
import { supabase } from "../lib/supabase";

export default function Rating() {
  const { orderId } = useParams();

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [message, setMessage] = useState("");

  const customerId = localStorage.getItem("customer_id");

  async function submitRating() {
    if (!rating) {
      setMessage("Pilih rating 1–5 dulu.");
      return;
    }

    // Ambil mitra_id dari tabel orders
    const { data } = await supabase
      .from("orders")
      .select("mitra_id")
      .eq("id", orderId)
      .single();

    if (!data?.mitra_id) {
      setMessage("Order belum memiliki mitra.");
      return;
    }

    const ok = await sendRating(orderId, data.mitra_id, customerId, rating, review);

    if (ok) {
      setMessage("Rating berhasil dikirim!");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } else {
      setMessage("Gagal mengirim rating.");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Beri Rating untuk Mitra</h2>

      <div style={{ margin: "15px 0" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onClick={() => setRating(n)}
            style={{
              fontSize: "32px",
              cursor: "pointer",
              color: rating >= n ? "#FFD700" : "#CCC",
              marginRight: "8px",
            }}
          >
            ★
          </span>
        ))}
      </div>

      <textarea
        placeholder="Tulis ulasan (opsional)"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        style={{
          width: "100%",
          height: "120px",
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "10px",
        }}
      />

      <button
        onClick={submitRating}
        style={{
          marginTop: "15px",
          width: "100%",
          padding: "12px",
          background: "#007bff",
          color: "white",
          borderRadius: "8px",
        }}
      >
        Kirim Rating
      </button>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </div>
  );
}
