import React from "react";

const statusMap = {
  ORDER_CREATED: "Order dibuat",
  WAITING_ASSIGNMENT: "Menunggu mitra",
  ASSIGNED: "Mitra ditugaskan",
  MITRA_ON_ROUTE: "Mitra OTW",
  IN_PROGRESS: "Sedang dikerjakan",
  EVIDENCE_SUBMITTED: "Menunggu konfirmasi",
  COMPLETED_PENDING_PAYMENT: "Menunggu pembayaran",
  PAID: "Sudah dibayar",
  CLOSED: "Selesai",
};

export default function OrderStatusChip({ status }) {
  const label = statusMap[status] || status;
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
      {label}
    </span>
  );
}
