import React, { useEffect, useState } from "react";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";
import { formatCurrency, formatDateTime } from "../utils/format";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  async function load() {
    try {
      setLoading(true);
      const res = await httpClient.get(endpoints.client.invoicesList);
      setInvoices(res?.invoices || res?.data || res?.items || []);
      setError("");
    } catch (err) {
      setError(formatFeatureError(err));
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
      await httpClient.post(endpoints.invoices.markPaidRequest, {
        payment_id: id,
      });
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
                  <p className="text-sm text-gray-500">
                    Invoice {inv.invoice_no}
                  </p>
                  <p className="font-semibold">{formatCurrency(inv.amount)}</p>
                  <p className="text-xs text-gray-500">Order #{inv.order_id}</p>

                  {/* Lanjutan UI detail (tanggal, status, tombol markPaid, dsb.)
                      biarkan sama seperti file Anda sekarang setelah bagian yang terpotong. */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
