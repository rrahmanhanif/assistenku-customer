import React, { useState } from "react";
import { api } from "../lib/apiClient";

export default function Help() {
  const [orderId, setOrderId] = useState("");
  const [category, setCategory] = useState("Pembayaran");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.createDispute({ order_id: orderId, category, description });
      setMessage("Dispute berhasil dibuat dan dicatat di timeline.");
      setDescription("");
      setOrderId("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container space-y-4">
      <header>
        <h2 className="section-title">Bantuan & Komplain</h2>
        <p className="section-subtitle">FAQ singkat dan form komplain resmi.</p>
      </header>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <section className="card space-y-2">
        <div className="section-title">FAQ</div>
        <ul className="list-disc pl-4 text-sm space-y-1">
          <li>Pembayaran manual: unggah bukti transfer pada detail pesanan.</li>
          <li>Evidence ditolak? Ajukan revisi lewat form keputusan evidence.</li>
          <li>
            Komplain resmi harus dibuat lewat form berikut agar terekam timeline.
          </li>
        </ul>
      </section>

      <section className="card space-y-2">
        <div className="section-title">Buat Komplain</div>
        <form className="space-y-2" onSubmit={submit}>
          <input
            type="text"
            placeholder="ID Pesanan"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Pembayaran">Pembayaran</option>
            <option value="Layanan">Layanan</option>
            <option value="Mitra">Mitra</option>
          </select>
          <textarea
            placeholder="Ceritakan masalah Anda"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit">
            Kirim komplain
          </button>
        </form>
      </section>
    </div>
  );
}
