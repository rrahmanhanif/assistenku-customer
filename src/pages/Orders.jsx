import React, { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import OrderStatusChip from "../components/OrderStatusChip";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { formatCurrency } from "../utils/format";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const { orders } = await apiGet(`/api/orders/list?scope=${tab}`);
      setOrders(orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [tab]);

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Pesanan</h1>

      {error && <ErrorBanner message={error} />}

      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded-full ${
            tab === "active" ? "bg-blue-600 text-white" : "border"
          }`}
          onClick={() => setTab("active")}
        >
          Aktif
        </button>
        <button
          className={`px-3 py-1 rounded-full ${
            tab === "history" ? "bg-blue-600 text-white" : "border"
          }`}
          onClick={() => setTab("history")}
        >
          Riwayat
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton lines={4} />
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500">Tidak ada pesanan.</p>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <a
              key={order.id}
              href={`/orders/${order.id}`}
              className="block border rounded-xl p-3 hover:border-blue-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{order.services?.name}</p>
                  <p className="font-semibold">{order.address_text}</p>
                  <p className="text-xs text-gray-500">
                    {order.schedule_at
                      ? new Date(order.schedule_at).toLocaleString()
                      : "Jadwal fleksibel"}
                  </p>
                </div>
                <div className="text-right">
                  <OrderStatusChip status={order.status} />
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(order.price_estimate)}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
