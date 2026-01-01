import React from "react";
import OrderStatusChip from "./OrderStatusChip";

export default function Timeline({ items }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-500">Belum ada timeline.</p>;
  }

  return (
    <ol className="relative border-l border-gray-200 ml-2 space-y-4">
      {items
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((event) => (
          <li key={event.id} className="ml-4">
            <div className="flex items-center gap-2">
              <OrderStatusChip status={event.to_status} />
              <span className="text-xs text-gray-500">
                {new Date(event.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              {event.note || "Perubahan status"}
            </p>
            <p className="text-xs text-gray-500">{event.actor_role}</p>
          </li>
        ))}
    </ol>
  );
}
