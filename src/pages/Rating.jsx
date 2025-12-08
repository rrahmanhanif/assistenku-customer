// src/pages/Rating.jsx
import React, { useState } from "react";
import supabase from "../lib/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

export default function Rating() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const customer_id = localStorage.getItem("customer_id");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitRating() {
    if (rating < 1) {
      alert("Pilih minimal 1 bintang.");
      return;
    }

    setLoading(true);

    // Ambil order untuk mengetahui mitra_id
    const { data: orderData } = await supabase
      .from("orders")
      .select("mitra_id")
      .eq("id", orderId)
      .single();

    if (!orderData?.mitra_id) {
      alert("Mitra tidak ditemukan pada order ini.");
      setLoading(false);
      return;
    }

    // Insert rating ke database
    const { error } = await supabase.from("ratings").insert({
      order_id: orderId,
      mitra_id: orderData.mitra_id,
      customer_id,
      rating,
      review,
    });

    if (error) {
      console.error(error);
      alert("Gagal mengirim rating.");
      setLoading(false);
      return;
    }

    alert("Rating berhasil dikirim!");
    navigate("/history");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Beri Rating untuk Mitra</h2>

      <div style={{ fontSize: "32px", marginBottom: "15px" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onClick={() => setRating(n)}
            style={{
              cursor: "pointer",
              color: n <= rating ? "gold" : "#ccc",
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
          height: "100px",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      />

      <button
        onClick={submitRating}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "12px",
          width: "100%",
          borderRadius: "8px",
          background: "#007bff",
          color: "white",
          fontSize: "16px",
        }}
      >
        {loading ? "Mengirim..." : "Kirim Rating"}
      </button>
    </div>
  );
}
