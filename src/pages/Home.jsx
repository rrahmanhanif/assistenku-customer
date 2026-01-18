import React, { useEffect, useState } from "react";
import ServiceCard from "../components/ServiceCard";
import OrderStatusChip from "../components/OrderStatusChip";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";
import { formatCurrency } from "../utils/format";

export default function Home() {
  const [services, setServices] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [whoami, setWhoami] = useState(null);
  const [whoamiError, setWhoamiError] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [invoicesError, setInvoicesError] = useState("");

  function formatFeatureError(err) {
    if (!err) return "FEATURE NOT READY";
    const details =
      err.details?.message ||
      err.details?.error ||
      err.details?.detail ||
      err.message ||
      JSON.stringify(err.details || {});
    return `FEATURE NOT READY: ${details}`;
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const [svcRes, pricingRes, ordersRes] = await Promise.all([
          httpClient.get(endpoints.config.services),
          httpClient.get(endpoints.config.pricing),
          httpClient.get(`${endpoints.orders.list}?scope=active`),
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

  useEffect(() => {
    let active = true;

    async function loadIdentity() {
      try {
        const whoamiRes = await httpClient.get(endpoints.auth.whoami);
        if (!active) return;
        setWhoami(whoamiRes);
        setWhoamiError("");
      } catch (err) {
        if (!active) return;
        setWhoamiError(formatFeatureError(err));
      }
    }

    async function loadInvoices() {
      try {
        const invoicesRes = await httpClient.get(endpoints.client.invoicesList);
        if (!active) return;

        const items =
          invoicesRes?.invoices ||
          invoicesRes?.data ||
          invoicesRes?.items ||
          [];

        setInvoices(Array.isArray(items) ? items : []);
        setInvoicesError("");
      } catch (err) {
        if (!active) return;
        setInvoicesError(formatFeatureError(err));
      }
    }

    loadIdentity();
    loadInvoices();

    return () => {
      active = false;
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

      <section className="bg-white border rounded-xl p-4 space-y-2">
        <h2 className="font-semibold text-lg">Status Login API</h2>
        {whoamiError ? (
          <p className="text-sm text-red-500">{whoamiError}</p>
        ) : whoami ? (
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              Role:{" "}
              {whoami?.role ||
                whoami?.data?.role ||
                whoami?.user?.role ||
                "-"}
            </p>
            <p>
              ID:{" "}
              {whoami?.id ||
                whoami?.user_id ||
                whoami?.user?.id ||
                whoami?.data?.id ||
                "-"}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Memuat profil...</p>
        )}
      </section>

      <section className="bg-white border rounded-xl p-4 space-y-2">
        <h2 className="font-semibold text-lg">Invoice Terbaru</h2>
        {invoicesError ? (
          <p className="text-sm text-red-500">{invoicesError}</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada invoice.</p>
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id || invoice.invoice_id}
                className="border rounded-lg p-2 text-sm"
              >
                <p className="font-semibold">
                  Invoice: {invoice.id || invoice.invoice_id || "-"}
                </p>
                <p className="text-gray-600">
                  Status: {invoice.status || invoice.state || "-"}
                </p>
                <p className="text-gray-600">
                  Total:{" "}
                  {invoice.total_amount ||
                    invoice.amount ||
                    invoice.total ||
                    "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

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
                      {/* Lanjutan render yang terpotong di patch Anda: biarkan sama seperti file Anda */}
                    </p>
                  </div>
                  <OrderStatusChip status={order.status} />
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Bagian services/pricing dan section lain: biarkan sama seperti file Anda setelah potongan diff */}
    </div>
  );
}
