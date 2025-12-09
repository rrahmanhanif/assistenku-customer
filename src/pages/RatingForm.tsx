import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { submitCustomerRating } from "../features/ratings/submitRating";
import toast from "react-hot-toast";

export default function RatingForm() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Load order data
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (data) setOrder(data);
      else toast.error("Order tidak ditemukan");
    }
    load();
  }, []);

  async function handleSubmit() {
    if (!rating) {
      toast.error("Silakan pilih rating");
      return;
    }

    setLoading(true);
    try {
      await submitCustomerRating({
        orderId: orderId!,
        mitraId: order?.mitra_id,
        rating,
        review,
      });

      toast.success("Terima kasih! Rating berhasil dikirim.");
      navigate("/");
    } catch (err) {
      toast.error("Gagal mengirim rating");
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Beri Penilaian</h1>

      <div className="bg-white p-4 rounded-xl shadow mb-5">
        <p className="font-semibold">Order ID:</p>
        <p className="text-gray-600">{orderId}</p>
      </div>

      <div className="mb-4">
        <p className="mb-2 font-semibold">Pilih Rating:</p>
        <div className="flex gap-3 text-4xl">
          {[1, 2, 3, 4, 5].map((num) => (
            <span
              key={num}
              onClick={() => setRating(num)}
              className={`cursor-pointer ${
                num <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <textarea
        placeholder="Tulis review..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
        className="w-full h-32 p-3 rounded-xl border border-gray-300 focus:ring focus:ring-blue-200"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-5 bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {loading ? "Menyimpan..." : "Kirim Rating"}
      </button>
    </div>
  );
}
