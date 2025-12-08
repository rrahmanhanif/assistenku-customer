// src/pages/Services.jsx
import React, { useEffect, useState } from "react";
import { getAllServices } from "../lib/services";

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getAllServices();
      setServices(data);
    }
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Layanan Assistenku</h2>

      {services.length === 0 && <p>Memuat layanan...</p>}

      {services.map((s) => (
        <div
          key={s.id}
          style={{
            padding: "15px",
            marginTop: "15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h3>{s.name}</h3>
          <p>Kategori: {s.category}</p>

          <p>
            Harga dasar: <b>Rp {Number(s.base_price).toLocaleString()}</b>
          </p>

          <p>
            Surge: <b>{s.surge_min}% – {s.surge_max}%</b>
          </p>

          <button
            style={{
              marginTop: "10px",
              padding: "10px",
              width: "100%",
              background: "#0080ff",
              color: "white",
              borderRadius: "6px",
            }}
            onClick={() =>
              window.location.href = `/order/create?service=${s.id}`
            }
          >
            Pilih Layanan Ini
          </button>
        </div>
      ))}
    </div>
  );
}
