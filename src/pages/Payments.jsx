import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/apiClient";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { payments } = await api.listPayments();
        setPayments(payments || []);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="page-container space-y-4">
      <header>
        <h2 className="section-title">Pembayaran</h2>
        <p className="section-subtitle">Pantau invoice dan unggah bukti transfer.</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="card skeleton h-24" />
      ) : payments.length === 0 ? (
        <div className="empty-state">Belum ada pembayaran.</div>
      ) : (
        <div className="space-y-3">
          {payments.map((pay) => (
            <Link key={pay.id} to={`/orders/${pay.order_id}`} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="section-title">{pay.invoice_no || "Invoice"}</div>
                  <p className="section-subtitle">Order #{pay.order_id?.slice(0, 8)}</p>
                  <p className="section-subtitle">Status: {pay.status}</p>
                  <p className="section-subtitle">Jumlah: Rp{pay.amount}</p>
                </div>
                <span className="badge">{pay.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
