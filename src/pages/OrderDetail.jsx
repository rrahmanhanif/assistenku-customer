import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPost } from "../api/client";
import OrderStatusChip from "../components/OrderStatusChip";
import Timeline from "../components/Timeline";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { formatCurrency, formatDateTime } from "../utils/format";

export default function OrderDetail() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decisionNote, setDecisionNote] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [polling, setPolling] = useState(null);

  async function loadOrder() {
    try {
      setLoading(true);
      const { order } = await apiGet(`/api/orders/${orderId}`);
      setOrder(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
    const timer = setInterval(loadOrder, 12000);
    setPolling(timer);
    return () => clearInterval(timer);
  }, [orderId]);

  async function sendEvidenceDecision(decision) {
    try {
      setError("");
      await apiPost(`/api/orders/${orderId}/evidence/decision`, {
        decision,
        note: decisionNote,
      });
      await loadOrder();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitDispute() {
    if (!disputeDesc) {
      setError("Deskripsi komplain wajib diisi");
      return;
    }
    try {
      setError("");
      await apiPost("/api/disputes/create", {
        order_id: orderId,
        category: "customer",
        description: disputeDesc,
      });
      await loadOrder();
      setDisputeDesc("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function markPaid(paymentId) {
    try {
      setError("");
      await apiPost("/api/invoices/mark-paid-request", { payment_id: paymentId });
      await loadOrder();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading)
    return (
      <div className="p-4">
        <LoadingSkeleton lines={6} />
      </div>
    );

  if (!order)
    return (
      <div className="p-4">
        <ErrorBanner message={error || "Order tidak ditemukan"} />
      </div>
    );

  return (
    <div className="p-4 space-y-4">
      {error && <ErrorBanner message={error} />}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Order #{order.id}</p>
          <h1 className="text-xl font-semibold">{order.services?.name}</h1>
          <p className="text-sm text-gray-600">{order.address_text}</p>
        </div>
        <OrderStatusChip status={order.status} />
      </div>

      <section className="border rounded-xl p-3 space-y-2">
        <h2 className="font-semibold">Timeline</h2>
        <Timeline items={order.order_timeline || []} />
      </section>

      <section className="border rounded-xl p-3 space-y-2">
        <h2 className="font-semibold">Biaya & Pembayaran</h2>
        <p className="text-sm">Estimasi: {formatCurrency(order.price_estimate)}</p>
        <p className="text-sm">Final: {formatCurrency(order.final_price)}</p>

        <div className="space-y-2">
          {(order.payments || []).map((pmt) => (
            <div key={pmt.id} className="border rounded-lg p-2">
              <div className="flex justify-between text-sm">
                <span>Invoice {pmt.invoice_no}</span>
                <span className="font-semibold">{pmt.status}</span>
              </div>
              <p className="text-sm">Jumlah: {formatCurrency(pmt.amount)}</p>

              {pmt.status !== "paid" && (
                <button
                  className="text-blue-600 text-sm"
                  onClick={() => markPaid(pmt.id)}
                >
                  Saya sudah bayar
                </button>
              )}
            </div>
          ))}

          {order.payments?.length === 0 && (
            <p className="text-sm text-gray-500">Belum ada invoice</p>
          )}
        </div>
      </section>

      <section className="border rounded-xl p-3 space-y-2">
        <h2 className="font-semibold">Evidence</h2>

        {(order.order_evidence || []).length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada bukti</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {(order.order_evidence || []).map((ev) => (
              <div key={ev.id} className="border rounded-lg p-2 text-sm">
                <p>{ev.description || ev.file_type}</p>
                <a
                  className="text-blue-600 text-xs"
                  href={ev.file_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Lihat file
                </a>
                <p className="text-gray-500 text-xs">
                  {formatDateTime(ev.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}

        {order.requires_evidence_approval && (
          <div className="space-y-2">
            <textarea
              className="w-full border rounded-lg p-2"
              placeholder="Catatan keputusan"
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                className="flex-1 border px-4 py-2 rounded-lg"
                onClick={() => sendEvidenceDecision("reject")}
              >
                Tolak
              </button>
              <button
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={() => sendEvidenceDecision("accept")}
              >
                Terima
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="border rounded-xl p-3 space-y-2">
        <h2 className="font-semibold">Komplain</h2>

        <textarea
          className="w-full border rounded-lg p-2"
          placeholder="Jelaskan masalah Anda"
          value={disputeDesc}
          onChange={(e) => setDisputeDesc(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={submitDispute}
        >
          Buat Komplain
        </button>

        {(order.disputes || []).length > 0 && (
          <div className="space-y-2">
            {order.disputes.map((dsp) => (
              <div key={dsp.id} className="border rounded-lg p-2 text-sm">
                <div className="flex justify-between">
                  <span>{dsp.category}</span>
                  <span className="font-semibold">{dsp.status}</span>
                </div>
                <p>{dsp.description}</p>
                <p className="text-gray-500 text-xs">
                  {formatDateTime(dsp.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
