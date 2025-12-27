import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function History() {
  const customerId = localStorage.getItem("customer_id");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchHistory() {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customerId)
      .order("updated_at", { ascending: false });

    if (fetchError) {
      console.error(fetchError);
      setError("Gagal memuat riwayat pesanan.");
    } else {
      setHistory(data || []);
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
                {order.updated_at
                  ? new Date(order.updated_at).toLocaleString()
                  : "-"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
