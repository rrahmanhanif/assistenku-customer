import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/Header";

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const customer_id = localStorage.getItem("customer_id");

  useEffect(() => {
    fetchOrders();
  }, []);

  // ===============================
  // Ambil hanya order milik customer
  // ===============================
  async function fetchOrders() {
    if (!customer_id) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customer_id)
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">
          Pesanan Saya
        </h2>

        {loading && (
          <p className="text-gray-600">Memuat pesanan...</p>
        )}

        {!loading && orders.length === 0 && (
          <p className="text-gray-600">Anda belum memiliki pesanan.</p>
        )}

        {!loading && orders.length > 0 && (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li
                key={o.id}
                className="p-4 bg-white rounded-lg shadow border"
              >
                <p>
                  <strong>Layanan:</strong> {o.layanan}
                </p>
                <p>
                  <strong>Dari:</strong> {o.alamat}
                </p>
                <p>
                  <strong>Tujuan:</strong> {o.tujuan}
                </p>

                <p className="mt-2">
                  <strong>Status:</strong>{" "}
                  <span className="text-blue-600 font-semibold">
                    {o.status}
                  </span>
                </p>

                {/* tombol ke tracking */}
                <button
                  onClick={() => (window.location.href = `/track/${o.id}`)}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded w-full"
                >
                  Lacak Perjalanan
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
