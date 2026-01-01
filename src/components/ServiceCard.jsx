import React from "react";

export default function ServiceCard({ service, onSelect }) {
  return (
    <button
      className="border rounded-xl p-3 w-full text-left hover:border-blue-500 transition"
      onClick={() => onSelect && onSelect(service)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{service.category || "Layanan"}</p>
          <p className="font-semibold text-lg">{service.name}</p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {service.description}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Mulai</p>
          <p className="font-bold text-blue-600">
            Rp{Number(service.base_price || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </button>
  );
}
