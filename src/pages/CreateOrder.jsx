import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ServiceCard from "../components/ServiceCard";
import { endpoints } from "../services/http/endpoints";
import { formatApiError } from "../services/http/errors";
import { httpClient } from "../services/http/httpClient";
import { formatCurrency } from "../utils/format";

function getServicePricing(service) {
  const base =
    Number(
      service?.base_price ??
        service?.price ??
        service?.amount ??
        service?.basePrice ??
        0
    ) || 0;

  const taxRate =
    Number(
      service?.tax_rate ??
        service?.tax_percent ??
        service?.tax_percentage ??
        0
    ) || 0;

  const taxAmount =
    Number(service?.tax_amount ?? service?.taxAmount ?? 0) ||
    (taxRate ? (base * taxRate) / 100 : 0);

  return {
    base,
    taxRate,
    taxAmount,
    total: base + taxAmount,
  };
}

export default function CreateOrder() {
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    address_text: "",
    schedule_at: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        setLoading(true);
        setError("");

        const res = await httpClient.get(endpoints.client.services);
        const items = res?.services || res?.data || res?.items || [];

        if (!active) return;

        const normalized = Array.isArray(items) ? items : [];
        setServices(normalized);

        const params = new URLSearchParams(location.search);
        const serviceId = params.get("service_id");
        if (serviceId) {
          const matched = normalized.find(
            (service) => String(service.id) === String(serviceId)
          );
          if (matched) setSelected(matched);
        }
      } catch (err) {
        if (active) setError(formatApiError(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadServices();
    return () => {
      active = false;
    };
  }, [location.search]);

  const selectedPricing = useMemo(
    () => (selected ? getServicePricing(selected) : null),
    [selected]
  );

  async function submitOrder(event) {
    event?.preventDefault();
    if (!selected) return;

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        service_id: selected.id,
        address_text: form.address_text,
        schedule_at: form.schedule_at || null,
        notes: form.notes || null,
      };

      const res = await httpClient.post(endpoints.client.orders, payload);
      const order = res?.order || res?.data || res;

      if (!order?.id) {
        throw new Error("Respons order tidak valid.");
      }

      window.location.href = `/orders/${order.id}`;
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <header className="bg-blue-600 text-white rounded-2xl p-4 shadow">
        <p className="text-sm opacity-80">Pesan layanan dengan cepat</p>
        <h1 className="text-2xl font-bold">Layanan Assistenku</h1>
      </header>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <LoadingSkeleton lines={4} />
      ) : !selected ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Pilih layanan</h2>
            <span className="text-xs text-gray-500">
              Harga sudah termasuk estimasi pajak
            </span>
          </div>

          {services.length === 0 ? (
            <div className="bg-white border rounded-xl p-4 text-sm text-gray-500">
              Belum ada layanan tersedia.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {services.map((service) => {
                const pricing = getServicePricing(service);
                return (
                  <div key={service.id} className="space-y-2">
                    <ServiceCard service={service} onSelect={setSelected} />
                    <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                      <span>
                        Pajak {pricing.taxRate ? `${pricing.taxRate}%` : "estimasi"}
                      </span>
                      <span>{formatCurrency(pricing.taxAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <button
            className="text-sm text-blue-600"
            onClick={() => setSelected(null)}
          >
            ← Kembali ke daftar layanan
          </button>

          <div className="bg-white border rounded-xl p-4 space-y-2">
            <h2 className="font-semibold text-lg">{selected.name}</h2>
            <p className="text-sm text-gray-600">{selected.description}</p>

            {selectedPricing && (
              <div className="text-sm text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Harga dasar</span>
                  <span>{formatCurrency(selectedPricing.base)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimasi pajak</span>
                  <span>{formatCurrency(selectedPricing.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(selectedPricing.total)}</span>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={submitOrder}
            className="bg-white border rounded-xl p-4 space-y-3"
          >
            <div>
              <label className="text-sm font-medium">Alamat layanan</label>
              <textarea
                className="mt-1 w-full border rounded-lg p-2 text-sm"
                rows={3}
                value={form.address_text}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    address_text: event.target.value,
                  }))
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Jadwal (opsional)</label>
              <input
                type="datetime-local"
                className="mt-1 w-full border rounded-lg p-2 text-sm"
                value={form.schedule_at}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    schedule_at: event.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Catatan tambahan (opsional)
              </label>
              <textarea
                className="mt-1 w-full border rounded-lg p-2 text-sm"
                rows={2}
                value={form.notes}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
              disabled={submitting}
            >
              {submitting ? "Memproses..." : "Buat Pesanan"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
