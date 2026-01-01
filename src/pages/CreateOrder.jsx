import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ServiceCard from "../components/ServiceCard";
import { formatCurrency } from "../utils/format";
import { validateOrderPayload } from "../utils/validators";

export default function CreateOrder() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    address_text: "",
    schedule_at: "",
    notes: "",
    addons: [],
  });
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { services } = await apiGet("/api/config/services");
        setServices(services || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const summary = useMemo(() => {
    if (!selected) return null;
    const base = Number(selected.base_price || 0);
    const addonsTotal = (form.addons || []).reduce(
      (sum, addon) =>
        sum +
        Number(addon.addon_price || 0) * Number(addon.qty || 1),
      0
    );
    return base + addonsTotal;
  }, [selected, form.addons]);

  async function fetchEstimate() {
    if (!selected) return;
    try {
      setSubmitting(true);
      const payload = { ...form, service_id: selected.id, dry_run: true };
      const errMsg = validateOrderPayload(payload);
      if (errMsg) throw new Error(errMsg);
      const res = await apiPost("/api/orders/create", payload);
      setEstimate(res.price_estimate || summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitOrder() {
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        service_id: selected?.id,
        address: form.address_text,
        dry_run: false,
      };
      const errMsg = validateOrderPayload(payload);
      if (errMsg) throw new Error(errMsg);
      const res = await apiPost("/api/orders/create", payload);
      window.location.href = `/orders/${res.order.id}`;
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Buat Pesanan</h1>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingSkeleton lines={4} />}

      {!loading && step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Pilih layanan</p>
          <div className="grid grid-cols-1 gap-3">
            {services.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                onSelect={(service) => {
                  setSelected(service);
                  setStep(2);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && step === 2 && selected && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Detail lokasi & jadwal</p>

          <textarea
            className="w-full border rounded-lg p-3"
            placeholder="Alamat lengkap"
            value={form.address_text}
            onChange={(e) =>
              setForm((v) => ({ ...v, address_text: e.target.value }))
            }
          />

          <input
            type="datetime-local"
            className="w-full border rounded-lg p-3"
            value={form.schedule_at}
            onChange={(e) =>
              setForm((v) => ({ ...v, schedule_at: e.target.value }))
            }
          />

          <textarea
            className="w-full border rounded-lg p-3"
            placeholder="Catatan untuk mitra"
            value={form.notes}
            onChange={(e) =>
              setForm((v) => ({ ...v, notes: e.target.value }))
            }
          />

          <div className="flex justify-between">
            <button className="text-blue-600" onClick={() => setStep(1)}>
              Kembali
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={() => setStep(3)}
            >
              Lanjut
            </button>
          </div>
        </div>
      )}

      {!loading && step === 3 && selected && (
        <div className="space-y-3">
          <h2 className="font-semibold">Ringkasan</h2>

          <div className="border rounded-xl p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Layanan</span>
              <span>{selected.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Harga dasar</span>
              <span>{formatCurrency(selected.base_price)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Estimasi</span>
              <span>{formatCurrency(estimate || summary)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex-1 border px-4 py-2 rounded-lg"
              disabled={submitting}
              onClick={fetchEstimate}
            >
              {submitting ? "Memuat..." : "Lihat Estimasi"}
            </button>

            <button
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg"
              disabled={submitting}
              onClick={submitOrder}
            >
              {submitting ? "Membuat..." : "Konfirmasi"}
            </button>
          </div>

          <button className="text-blue-600" onClick={() => setStep(2)}>
            Kembali
          </button>
        </div>
      )}
    </div>
  );
}
