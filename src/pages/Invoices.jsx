import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { formatCurrency, formatDateTime } from "../utils/format";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const { invoices } = await apiGet("/api/invoices/list");
      setInvoices(invoices || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markPaid(id) {
    try {
      setError("");
      await apiPost("/api/invoices/mark-paid-request", { payment_id: id });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Invoice & Pembayaran</h1>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <LoadingSkeleton lines={4} />
      ) : invoices.length === 0 ? (
        <p className="text-sm text-gray-500">Tidak ada invoice.</p>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="border rounded-xl p-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Invoice {inv.invoice_no}</p>
                  <p className="font-semibold">{formatCurrency(inv.amount)}</p>
                  <p className="text-xs text-gray-500">Order #{inv.order_id}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{inv.status}</p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(inv.created_at)}
                  </p>
                </div>
              </div>

              {inv.status !== "paid" && (
                <button
                  className="text-blue-600 text-sm"
                  onClick={() => markPaid(inv.id)}
                >
                  Saya sudah bayar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
