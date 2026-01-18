import React, { useEffect, useState } from "react";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";
import { formatDateTime } from "../utils/format";

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [category, setCategory] = useState("service");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const { disputes } = await httpClient.get(endpoints.disputes.list);
      setDisputes(disputes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    if (!orderId || !description) {
      setError("Order ID dan deskripsi wajib diisi");
      return;
    }

    try {
      setError("");
      await httpClient.post(endpoints.disputes.create, {
        order_id: orderId,
        category,
        description,
      });
      setOrderId("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Bantuan & Komplain</h1>

      {error && <ErrorBanner message={error} />}

      <div className="border rounded-xl p-3 space-y-2">
        <h2 className="font-semibold">Buat Komplain</h2>

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />

        {/* Lanjutan form (category, description, tombol submit) dan daftar disputes
            biarkan sama seperti file Anda sekarang setelah bagian ini. */}
      </div>
    </div>
  );
}
