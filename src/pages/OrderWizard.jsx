import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/apiClient";

const steps = ["Pilih layanan", "Detail & addon", "Ringkasan"];

export default function OrderWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    service_id: "",
    address_id: "",
    address: "",
    schedule_at: "",
    notes: "",
    addons: [],
  });

  const selectedService = useMemo(
    () => services.find((s) => s.id === form.service_id),
    [services, form.service_id]
  );

  useEffect(() => {
    async function load() {
      setError("");
      try {
        const [svcRes, profileRes] = await Promise.all([api.listServices(), api.me()]);

        setServices(svcRes.services || []);
        setAddresses(profileRes.customer?.customer_addresses || []);

        const serviceIdFromQuery = searchParams.get("service_id");
        const defaultService = serviceIdFromQuery || svcRes.services?.[0]?.id || "";

        setForm((f) => ({
          ...f,
          service_id: defaultService,
          address_id:
            profileRes.customer?.default_address_id ||
            profileRes.customer?.customer_addresses?.[0]?.id ||
            "",
        }));
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [searchParams]);

  useEffect(() => {
    if (!form.service_id) return;
    handleEstimate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.service_id, JSON.stringify(form.addons)]);

  const handleEstimate = async () => {
    if (!form.service_id) return;
    try {
      const { price_estimate } = await api.estimateOrder({
        service_id: form.service_id,
        addons: form.addons,
      });
      setEstimate(price_estimate);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        service_id: form.service_id,
        address_id: form.address_id || undefined,
        address: form.address || undefined,
        schedule_at: form.schedule_at,
        notes: form.notes,
        addons: form.addons.filter((a) => a.addon_name),
      };

      const { order } = await api.createOrder(payload);
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const addAddon = () => {
    setForm((f) => ({
      ...f,
      addons: [...f.addons, { addon_name: "", addon_price: 0, qty: 1 }],
    }));
  };

  const updateAddon = (idx, key, value) => {
    setForm((f) => ({
      ...f,
      addons: f.addons.map((addon, i) => (i === idx ? { ...addon, [key]: value } : addon)),
    }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="page-container space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Buat Pesanan</h2>
          <p className="section-subtitle">3 langkah cepat ala superapp.</p>
        </div>
        <div className="flex gap-2 text-sm">
          {steps.map((s, idx) => (
            <span key={s} className={`badge ${idx === step ? "badge-primary" : ""}`}>
              {idx + 1}. {s}
            </span>
          ))}
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {step === 0 && (
          <div className="card space-y-3">
            <label className="form-field">
              <span>Layanan</span>
              <select
                value={form.service_id}
                onChange={(e) => setForm((f) => ({ ...f, service_id: e.target.value }))}
                required
              >
                <option value="">Pilih layanan</option>
                {services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} (Mulai Rp{srv.base_price || 0})
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Alamat</span>
              <select
                value={form.address_id}
                onChange={(e) => setForm((f) => ({ ...f, address_id: e.target.value }))}
              >
                <option value="">Ketik manual</option>
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label || "Alamat"} - {addr.address_text}
                  </option>
                ))}
              </select>

              {!form.address_id && (
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Tuliskan alamat lengkap"
                  required
                />
              )}
            </label>

            <label className="form-field">
              <span>Jadwal</span>
              <input
                type="datetime-local"
                value={form.schedule_at}
                onChange={(e) => setForm((f) => ({ ...f, schedule_at: e.target.value }))}
                required
              />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="card space-y-3">
            <label className="form-field">
              <span>Catatan</span>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Preferensi khusus"
              />
            </label>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="section-title">Tambahan</div>
                <button type="button" className="btn" onClick={addAddon}>
                  + Tambah Addon
                </button>
              </div>

              {form.addons.length === 0 && <p className="section-subtitle">Belum ada tambahan.</p>}

              {form.addons.map((addon, idx) => (
                <div key={idx} className="grid gap-2 md:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Nama addon"
                    value={addon.addon_name}
                    onChange={(e) => updateAddon(idx, "addon_name", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Harga"
                    value={addon.addon_price}
                    onChange={(e) => updateAddon(idx, "addon_price", Number(e.target.value))}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={addon.qty}
                    onChange={(e) => updateAddon(idx, "qty", Number(e.target.value))}
                  />
                </div>
              ))}
            </div>

            <button type="button" className="btn" onClick={handleEstimate}>
              Hitung ulang estimasi
            </button>

            <div className="section-subtitle">
              Perkiraan biaya server: Rp{estimate ?? selectedService?.base_price || 0}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card space-y-2">
            <div className="section-title">Ringkasan</div>
            <p className="section-subtitle">Layanan: {selectedService?.name || "-"}</p>
            <p className="section-subtitle">
              Alamat:{" "}
              {form.address_id
                ? addresses.find((a) => a.id === form.address_id)?.address_text
                : form.address}
            </p>
            <p className="section-subtitle">
              Jadwal: {form.schedule_at ? new Date(form.schedule_at).toLocaleString() : "-"}
            </p>
            <p className="section-subtitle">Catatan: {form.notes || "-"}</p>
            <p className="section-subtitle">
              Estimasi server: Rp{estimate ?? selectedService?.base_price || 0}
            </p>

            {form.addons.length > 0 && (
              <ul className="text-sm list-disc pl-4">
                {form.addons.map((addon, idx) => (
                  <li key={idx}>
                    {addon.addon_name || "Addon"} - Rp{addon.addon_price || 0} x {addon.qty || 1}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button type="button" className="btn" onClick={prevStep} disabled={step === 0}>
            Kembali
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={nextStep}
              disabled={!form.service_id}
            >
              Lanjut
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Memproses..." : "Konfirmasi & buat pesanan"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
