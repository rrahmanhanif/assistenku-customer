import React, { useEffect, useState } from "react";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";
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

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        setLoading(true);
        setError("");

        const res = await httpClient.get(endpoints.client.services);
        const items = res?.services || res?.data || res?.items || [];
        if (active) setServices(Array.isArray(items) ? items : []);
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
  }, []);

  return (
    <div className="p-4 space-y-4">
      <header className="bg-blue-600 text-white rounded-2xl p-5 shadow space-y-2">
        <p className="text-sm opacity-80">Assistenku Customer</p>
        <h1 className="text-2xl font-bold">Bantuan cepat ala ride-hailing</h1>
        <p className="text-sm opacity-90">
          Pilih layanan, pesan, bayar, dan pantau statusnya.
        </p>
        <button
          className="bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg"
          onClick={() => (window.location.href = "/order/new")}
        >
          Buat Pesanan Baru
        </button>
      </header>

      {error && <ErrorBanner message={error} />}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Layanan tersedia</h2>
          <span className="text-xs text-gray-500">
            Estimasi pajak dihitung otomatis
          </span>
        </div>

        {loading ? (
          <LoadingSkeleton lines={4} />
        ) : services.length === 0 ? (
          <div className="bg-white border rounded-xl p-4 text-sm text-gray-500">
            Belum ada layanan tersedia.
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => {
              const pricing = getServicePricing(service);

              return (
                <div
                  key={service.id}
                  className="bg-white border rounded-xl p-4 space-y-2"
                >
                  <div>
                    <p className="text-xs text-gray-500">
                      {service.category || "Layanan"}
                    </p>
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    <p className="text-sm text-gray-600">
                      {service.description}
                    </p>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Harga dasar</span>
                      <span>{formatCurrency(pricing.base)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        Pajak{" "}
                        {pricing.taxRate ? `${pricing.taxRate}%` : "estimasi"}
                      </span>
                      <span>{formatCurrency(pricing.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(pricing.total)}</span>
                    </div>
                  </div>

                  <button
                    className="w-full bg-blue-600 text-white py-2 rounded-lg"
                    onClick={() =>
                      (window.location.href = `/order/new?service_id=${service.id}`)
                    }
                  >
                    Pesan
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
