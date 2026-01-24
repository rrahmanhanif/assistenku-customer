import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import OrderStatusChip from "../components/OrderStatusChip";
import { endpoints } from "../services/http/endpoints";
import { formatApiError } from "../services/http/errors";
import { httpClient } from "../services/http/httpClient";
import { formatCurrency, formatDateTime } from "../utils/format";

function formatCountdown(target) {
  if (!target) return "-";
  const diff = Math.max(0, target - Date.now());
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export default function OrderDetail() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [now, setNow] = useState(Date.now());

  const loadOrder = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        setError("");

        const res = await httpClient.get(endpoints.client.orderDetail(orderId));
        const payload = res?.order || res?.data || res;

        setOrder(payload);

        if (payload?.expires_at) {
          setExpiresAt(new Date(payload.expires_at).getTime());
        }
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
        if (isRefresh) setRefreshing(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    loadOrder();
    const interval = setInterval(() => loadOrder(true), 15000);
    return () => clearInterval(interval);
  }, [loadOrder]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => formatCountdown(expiresAt), [expiresAt, now]);
  const expired = expiresAt ? now >= expiresAt : false;

  async function handlePay() {
    if (!orderId) return;
    try {
      setPaying(true);
      setError("");

      const res = await httpClient.post(endpoints.client.orderPay(orderId));
      const paymentUrl =
        res?.doku_payment_url ||
        res?.payment?.doku_payment_url ||
        res?.data?.doku_payment_url;

      const expiry =
        res?.expires_at || res?.payment?.expires_at || res?.data?.expires_at;

      if (expiry) setExpiresAt(new Date(expiry).getTime());

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      throw new Error("Link pembayaran tidak tersedia.");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4">
        <ErrorBanner message={error || "Order tidak ditemukan."} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {error && <ErrorBanner message={error} />}

      <div className="bg-white border rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="font-semibold">{order.id}</p>
          </div>
          <OrderStatusChip status={order.status_order || order.status} />
        </div>

        <div className="text-sm text-gray-600">
          <p>Service: {order.service_name || order.service?.name || "-"}</p>
          <p>Alamat: {order.address_text || order.address || "-"}</p>
          <p>Dibuat: {formatDateTime(order.created_at)}</p>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-4 space-y-2">
        <h2 className="font-semibold text-lg">Ringkasan Pembayaran</h2>

        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal || order.base_price)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pajak</span>
            <span>{formatCurrency(order.tax_amount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-800">
            <span>Total</span>
            <span>{formatCurrency(order.total_amount || order.total_price)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Status pembayaran</span>
            <span>{order.status_payment || order.payment_status || "-"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Expiry pembayaran</span>
          <span>{expiresAt ? countdown : "-"}</span>
        </div>

        <button
          onClick={handlePay}
          disabled={paying || expired}
          className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-60"
        >
          {paying ? "Mengarahkan..." : expired ? "Pembayaran kedaluwarsa" : "Bayar"}
        </button>

        <p className="text-xs text-gray-500">
          Jika pembayaran tidak terkonfirmasi, Admin dapat menandai pembayaran
          sebagai PAID.
        </p>
      </div>

      <div className="bg-white border rounded-2xl p-4 space-y-2">
        <h2 className="font-semibold text-lg">Tracking Status</h2>

        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Status order</span>
            <span>{order.status_order || order.status || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span>Status pembayaran</span>
            <span>{order.status_payment || order.payment_status || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span>Terakhir update</span>
            <span>{formatDateTime(order.updated_at)}</span>
          </div>
        </div>

        <button
          onClick={() => loadOrder(true)}
          className="w-full border border-blue-200 text-blue-600 py-2 rounded-lg"
          disabled={refreshing}
        >
          {refreshing ? "Memuat..." : "Refresh Status"}
        </button>
      </div>
    </div>
  );
}
