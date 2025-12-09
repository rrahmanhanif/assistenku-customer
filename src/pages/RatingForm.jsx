import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { submitCustomerRating } from "../features/ratings/submitRating";

export default function RatingForm() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  // Load info order
  useEffect(() => {
    async function loadOrder() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (data) setOrder(data);
    }
    loadOrder();
  }, []);

  async function handleSubmit() {
    if (rating === 0) {
      alert("Silakan pilih rating");
      return;
    }

    setLoading(true);
    try {
      await submitCustomerRating({
        orderId,
        mitraId: order?.mitra_id,
        rating,
        review
      });

      alert("Terima kasih atas penilaian Anda!");
      navigate("/"); // kembali ke home
    } catch (err) {
      alert("Gagal submit rating");
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Rating Layanan</h2>
      <p>Order ID: {orderId}</p>

      {/* Pilihan Rating */}
      <div style={{ marginTop: 20 }}>
        <p>Pilih Rating:</p>
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            onClick={() => setRating(num)}
            style={{
              fontSize: 30,
              cursor: "pointer",
              color: num <= rating ? "gold" : "gray"
            }}
          >
            ★
          </span>
        ))}
      </div>

      {/* Review */}
      <div style={{ marginTop: 20 }}>
        <textarea
          placeholder="Tulis review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          style={{ width: "100%", height: 100 }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 18
        }}
      >
        {loading ? "Menyimpan..." : "Kirim Rating"}
      </button>
    </div>
  );
}
