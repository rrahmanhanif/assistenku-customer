import React, { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import ServiceCard from "../components/ServiceCard";
import OrderStatusChip from "../components/OrderStatusChip";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { formatCurrency } from "../utils/format";

export default function Home() {
  const [services, setServices] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const [svcRes, pricingRes, ordersRes] = await Promise.all([
          apiGet("/api/config/services"),
          apiGet("/api/config/pricing"),
          apiGet("/api/orders/list?scope=active"),
        ]);

        if (!active) return;

        setServices(svcRes.services || []);
        setPricing(pricingRes);
        setOrders(ordersRes.orders || []);
      } catch (err) {
        if (!active) return;
        setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="p-4 space-y-4">
      <header className="bg-blue-600 text-white rounded-2xl p-4 shadow">
        <p className="text-sm opacity-80">Lokasi default</p>
        <h1 className="text-2xl font-bold">Assistenku semudah digenggaman</h1>
        <input
          className="mt-3 w-full p-2 rounded-lg text-black"
          placeholder="Butuh bantuan apa hari ini?"
        />
      </header>

      {error && <ErrorBanner message={error} />}

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">Pesanan Aktif</h2>
          <a className="text-blue-600 text-sm" href="/orders">
            Lihat semua
          </a>
        </div>

        {loading ? (
          <LoadingSkeleton lines={3} />
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada pesanan aktif.</p>
        ) : (
          <div className="space-y-3">
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
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">Layanan</h2>
        </div>

        {loading ? (
          <LoadingSkeleton lines={5} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={() => {
                  window.location.href = `/order/new?service=${service.id}`;
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-gray-50 border rounded-xl p-3">
        <h2 className="font-semibold text-lg mb-1">Pricing version</h2>
        <p className="text-sm text-gray-600">
          {pricing ? pricing.pricing_version : "Memuat..."}
        </p>
      </section>
    </div>
  );
}
