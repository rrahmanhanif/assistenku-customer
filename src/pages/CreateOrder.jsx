import React, { useEffect, useMemo, useState } from "react";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ServiceCard from "../components/ServiceCard";
import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";
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
        const { services } = await httpClient.get(endpoints.config.services);
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
        sum + Number(addon.addon_price || 0) * Number(addon.qty || 1),
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

      const res = await httpClient.post(endpoints.orders.create, payload);
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

      const res = await httpClient.post(endpoints.orders.create, payload);
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
                  // Lanjutan file Anda tetap sama setelah ini
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
