import React, { useEffect, useState } from "react";
import { api } from "../lib/apiClient";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    setError("");

    try {
      const { orders } = await api.listOrders();
      setHistory(orders || []);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <div className="page-container space-y-4">
      <header>
        <h2 className="section-title">Riwayat Pesanan</h2>
        <p className="section-subtitle">
          Pantau status dan detail pesanan yang pernah Anda buat.
        </p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="card skeleton">
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="empty-state">Tidak ada riwayat pesanan</div>
      ) : (
        <ul className="space-y-3">
          {history.map((order) => (
            <li key={order.id} className="card">
              <div className="section-title">Pesanan #{order.id}</div>

              <p className="section-subtitle">
                Status: <strong>{order.status}</strong>
              </p>

              <p className="section-subtitle">
                Diperbarui:{" "}
                {order.updated_at ? new Date(order.updated_at).toLocaleString() : "-"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
