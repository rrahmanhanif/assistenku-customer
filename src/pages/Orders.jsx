import React, { useEffect, useState } from "react";
import OrderStatusChip from "../components/OrderStatusChip";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";
import { formatCurrency } from "../utils/format";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const { orders } = await httpClient.get(
        `${endpoints.orders.list}?scope=${tab}`
      );
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
            tab === "completed" ? "bg-blue-600 text-white" : "border"
          }`}
          onClick={() => setTab("completed")}
        >
          Selesai
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
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {order.services?.name || "-"}
                  </p>
                  <p className="font-semibold">{order.address_text}</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(order.total_amount || 0)}
                  </p>
                </div>
                <OrderStatusChip status={order.status} />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
