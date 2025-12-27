// src/pages/Services.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { createOrder } from "../lib/order";

export default function Services() {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [duration, setDuration] = useState("1_jam");
  const [includeOvertime, setIncludeOvertime] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const customer_id = localStorage.getItem("customer_id");
  const customer_name = localStorage.getItem("customer_name");

  async function loadServices() {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("services")
      .select("*")
      .eq("active", true);

    if (fetchError) {
      console.error(fetchError);
      setError("Gagal memuat layanan, coba lagi nanti.");
    }

    setServices(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadServices();
  }, []);

  function calculateTotal() {
    if (!selected) return 0;

    const durationPrice =
      {
        "1_jam": selected.price_hour,
        "4_jam": selected.price_4h,
        "8_jam": selected.price_day,
        "1_minggu": selected.price_week,
        "1_bulan": selected.price_month,
        "1_tahun": selected.price_year,
      }[duration] ?? selected.base_price;

    const surge = selected.default_surge || 0;
    const overtime = includeOvertime ? selected.default_overtime : 0;

    return Number(durationPrice || 0) + Number(surge || 0) + Number(overtime || 0);
  }

  const totalPrice = calculateTotal();

  async function handleOrder() {
    if (!selected) return;

    setSubmitting(true);

    const order = await createOrder({
      customer_id,
      customer_name,
      service_id: selected.id,
      service_name: selected.name,
      duration: duration,
      base_price: selected.base_price,
      total_price: totalPrice,
    });

    setSubmitting(false);

    if (!order) {
      alert("Gagal membuat order");
      return;
    }

    window.location.href = `/track/${order.id}`;
  }

  return (
    <div className="page-container space-y-4">
      <header>
        <h2 className="section-title">Semua Layanan</h2>
        <p className="section-subtitle">Pilih layanan sesuai kebutuhan Anda.</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="card skeleton">
              <div className="skeleton-line medium" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          ))}
        </div>
      ) : !selected ? (
        services.length === 0 ? (
          <div className="empty-state">Belum ada layanan yang tersedia.</div>
        ) : (
          <div className="space-y-3">
            {services.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelected(s)}
                className="card service-card"
              >
                <h3 className="section-title">{s.name}</h3>
                <p className="section-subtitle">{s.description}</p>
                <strong>Mulai dari Rp {Number(s.base_price).toLocaleString()}</strong>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="card">
            <h2 className="section-title">{selected.name}</h2>
            <p className="section-subtitle">{selected.description}</p>
          </div>

          <div className="card space-y-3">
            <div>
              <h3 className="section-title">Pilih Durasi</h3>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="select-control"
              >
                <option value="1_jam">1 Jam</option>
                <option value="4_jam">4 Jam</option>
                <option value="8_jam">8 Jam (Harian)</option>
                <option value="1_minggu">Mingguan</option>
                <option value="1_bulan">Bulanan</option>
                <option value="1_tahun">Tahunan</option>
              </select>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={includeOvertime}
                onChange={() => setIncludeOvertime(!includeOvertime)}
              />
              <span>Tambah lembur</span>
            </label>

            <div className="price-box">Rp {totalPrice.toLocaleString()}</div>

            <button
              className="btn-primary"
              onClick={handleOrder}
              disabled={submitting}
            >
              {submitting ? "Memproses..." : "Pesan Sekarang"}
            </button>

            <button className="btn-secondary" onClick={() => setSelected(null)}>
              Kembali
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
