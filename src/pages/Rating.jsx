// src/pages/Rating.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
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

    try {
      // Ambil order untuk mengetahui mitra_id
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .select("mitra_id")
        .eq("id", orderId)
        .single();

      if (orderErr || !orderData?.mitra_id) {
        console.error("Gagal ambil mitra_id:", orderErr);
        alert("Tidak dapat memuat data mitra untuk order ini.");
        setLoading(false);
        return;
      }

      // Simpan rating
      // Catatan: pastikan tabel Anda sesuai (mis. "ratings" / "reviews")
      const { error: insertErr } = await supabase.from("ratings").insert([
        {
          order_id: orderId,
          customer_id,
          mitra_id: orderData.mitra_id,
          rating,
          review,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertErr) {
        console.error("Gagal simpan rating:", insertErr);
        alert("Gagal mengirim rating. Coba lagi.");
        setLoading(false);
        return;
      }

      // Optional: update status order jadi selesai / rated (jika skema Anda mendukung)
      await supabase
        .from("orders")
        .update({ status: "SELESAI", rated: true })
        .eq("id", orderId);

      alert("Terima kasih! Rating berhasil dikirim.");
      navigate("/history");
    } catch (err) {
      console.error("submitRating error:", err);
      alert("Terjadi kesalahan.");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
      <h2>Beri Rating</h2>

      <p style={{ marginTop: 10, marginBottom: 8 }}>Rating:</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: rating >= n ? "#f59e0b" : "white",
              color: rating >= n ? "white" : "#111827",
              cursor: "pointer",
              fontSize: 18,
              fontWeight: 700,
            }}
            aria-label={`${n} bintang`}
          >
            ★
          </button>
        ))}
      </div>

      <p style={{ marginTop: 0, marginBottom: 8 }}>Ulasan (opsional):</p>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Tulis ulasan singkat..."
        rows={4}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #d1d5db",
          marginBottom: 16,
        }}
      />

      <button
        onClick={submitRating}
        disabled={loading}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 10,
          border: "none",
          background: "#16a34a",
          color: "white",
          fontSize: 16,
          cursor: "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Mengirim..." : "Kirim Rating"}
      </button>
    </div>
  );
}
