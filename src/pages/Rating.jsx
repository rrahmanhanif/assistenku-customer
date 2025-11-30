import React, { useState } from "react";
import { submitRating } from "../lib/ratingClient";
import { useParams } from "react-router-dom";

export default function Rating() {
  const { orderId } = useParams();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const handleSubmit = async () => {
    const hasil = await submitRating({
      order_id: orderId,
      customer_id: localStorage.getItem("customer_id"),
      mitra_id: localStorage.getItem("mitra_id"),
      rating,
      review
    });

    if (hasil.error) {
      alert("Gagal simpan rating: " + hasil.error.message);
    } else {
      alert("Rating berhasil disimpan");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Berikan Rating</h2>

      <div style={{ marginBottom: 10 }}>
        <label>Nilai:</label><br/>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[...Array(5)].map((_, i) => (
            <option value={i+1} key={i}>{i + 1} ⭐</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Ulasan:</label><br/>
        <textarea
          placeholder="Tulis ulasan..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          style={{ width: "100%", height: 100 }}
        ></textarea>
      </div>

      <button onClick={handleSubmit}>Kirim Rating</button>
    </div>
  );
}
