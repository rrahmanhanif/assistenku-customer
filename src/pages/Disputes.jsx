import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
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
      const { disputes } = await apiGet("/api/disputes/list");
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
      await apiPost("/api/disputes/create", {
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

        <select
          className="w-full border rounded-lg p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="service">Layanan</option>
          <option value="payment">Pembayaran</option>
          <option value="other">Lainnya</option>
        </select>

        <textarea
          className="w-full border rounded-lg p-2"
          placeholder="Deskripsi masalah"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={submit}
        >
          Kirim
        </button>
      </div>

      <div className="border rounded-xl p-3 space-y-2">
        <h2 className="font-semibold">Riwayat Komplain</h2>

        {loading ? (
          <LoadingSkeleton lines={4} />
        ) : disputes.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada komplain.</p>
        ) : (
          <div className="space-y-2">
            {disputes.map((d) => (
              <div key={d.id} className="border rounded-lg p-2 text-sm">
                <div className="flex justify-between">
                  <span>Order #{d.order_id}</span>
                  <span className="font-semibold">{d.status}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {formatDateTime(d.created_at)}
                </p>
                <p>{d.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
