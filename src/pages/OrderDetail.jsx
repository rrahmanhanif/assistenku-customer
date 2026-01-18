import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OrderStatusChip from "../components/OrderStatusChip";
import Timeline from "../components/Timeline";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";
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
      const { order } = await httpClient.get(endpoints.orders.detail(orderId));
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
      await httpClient.post(endpoints.orders.evidenceDecision(orderId), {
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
      await httpClient.post(endpoints.disputes.create, {
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
      await httpClient.post(endpoints.invoices.markPaidRequest, {
        payment_id: paymentId,
      });
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
        {/* Lanjutan UI Anda setelah baris ini biarkan sama seperti file sekarang.
            Diff terpotong di sini, jadi saya belum melihat sisa render-nya. */}
      </div>
    </div>
  );
}
