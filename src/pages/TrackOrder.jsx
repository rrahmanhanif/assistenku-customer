// src/pages/TrackOrder.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { subscribeOrderStatus } from "../lib/orderRealtime";
import { subscribeMitraLocation } from "../lib/mitraLocation";
import { subscribeOvertime } from "../lib/overtimeRealtime";
import { subscribePayment } from "../lib/paymentRealtime";
import { approveOvertime, rejectOvertime } from "../lib/overtime";
import { startCustomerLiveGps } from "../modules/gpsTrackerCustomer";

function getDefaultMarker() {
  return L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
}

export default function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [statusText, setStatusText] = useState("Memuat...");

  const [locationStatus, setLocationStatus] = useState(
    "Menunggu izin lokasi..."
  );
  const [customerLocation, setCustomerLocation] = useState(null);

  const mapRef = useRef(null);
  const markersRef = useRef({ driver: null, customer: null });
  const customerTrackerRef = useRef(null);

  // ========= FETCH ORDER AWAL =========
  async function loadOrder() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (data) {
      setOrder(data);
      setStatusText(data.status);
    }
  }

  // ========= LOAD + STATUS REALTIME =========
  useEffect(() => {
    if (!orderId) return;

    loadOrder();

    const subStatus = subscribeOrderStatus(orderId, (newData) => {
      setOrder(newData);
      setStatusText(newData.status);

      if (newData.status === "FINISHED") {
        // diarahkan ke rating (sesuaikan kalau status Anda berbeda)
        navigate(`/rating/${orderId}`);
      }
    });

    return () => supabase.removeChannel(subStatus);
  }, [orderId, navigate]);

  // ========= REALTIME MITRA LOCATION =========
  useEffect(() => {
    if (!orderId) return;

    const subLoc = subscribeMitraLocation(orderId, (loc) => {
      // Pastikan struktur loc menyediakan lat/lng
      // Bila payload Anda punya nama field lain, sesuaikan di sini.
      const mitra_lat = loc?.lat ?? loc?.mitra_lat;
      const mitra_lng = loc?.lng ?? loc?.mitra_lng;

      if (typeof mitra_lat === "number" && typeof mitra_lng === "number") {
        setOrder((prev) => ({
          ...(prev || {}),
          mitra_lat,
          mitra_lng,
        }));
      }
    });

    return () => supabase.removeChannel(subLoc);
  }, [orderId]);

  // ========= REALTIME OVERTIME REQUEST =========
  useEffect(() => {
    if (!orderId) return;

    const subOT = subscribeOvertime(orderId, async (req) => {
      if (!req) return;

      // contoh: req.minutes / req.price / req.id
      const ok = window.confirm(
        `Mitra mengajukan overtime.\nDurasi: ${req.minutes || req.overtime_minutes || 0} menit\nLanjutkan?`
      );

      try {
        if (ok) {
          await approveOvertime(req.id);
          alert("Overtime disetujui.");
        } else {
          await rejectOvertime(req.id);
          alert("Overtime ditolak.");
        }
      } catch (err) {
        console.error("Overtime action error:", err);
        alert("Gagal memproses overtime. Coba lagi.");
      }
    });

    return () => supabase.removeChannel(subOT);
  }, [orderId]);

  // ========= REALTIME PAYMENT STATUS =========
  useEffect(() => {
    if (!orderId) return;

    const subPay = subscribePayment(orderId, (updated) => {
      setOrder(updated);

      if (updated?.payment_status === "PAID") {
        alert("Pembayaran diterima! Pesanan aktif.");
      }
    });

    return () => supabase.removeChannel(subPay);
  }, [orderId]);

  // ========= REQUEST/UPDATE CUSTOMER LOCATION =========
  useEffect(() => {
    if (!order) return;

    const customerId = order.customer_id || order.user_id;
    if (!customerId) {
      setLocationStatus("ID pelanggan tidak tersedia");
      return;
    }

    // stop tracker sebelumnya bila ada
    if (customerTrackerRef.current?.stop) {
      customerTrackerRef.current.stop();
      customerTrackerRef.current = null;
    }

    const tracker = startCustomerLiveGps(
      customerId,
      order.customer_name || "Pelanggan",
      {
        onStatusChange: setLocationStatus,
        onLocation: (coords) => setCustomerLocation(coords),
      }
    );

    customerTrackerRef.current = tracker;

    return () => {
      if (customerTrackerRef.current?.stop) {
        customerTrackerRef.current.stop();
        customerTrackerRef.current = null;
      }
    };
  }, [order]);

  // ========= INIT MAP =========
  useEffect(() => {
    if (mapRef.current) return;

    const initialPoint =
      customerLocation ||
      (order?.mitra_lat && order?.mitra_lng
        ? { lat: order.mitra_lat, lng: order.mitra_lng }
        : null);

    if (!initialPoint) return;

    const map = L.map("tracking-map").setView(
      [initialPoint.lat, initialPoint.lng],
      15
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      try {
        map.remove();
      } catch {}
      mapRef.current = null;
      markersRef.current = { driver: null, customer: null };
    };
  }, [customerLocation, order?.mitra_lat, order?.mitra_lng]);

  // ========= DRIVER MARKER =========
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !order?.mitra_lat || !order?.mitra_lng) return;

    const icon = getDefaultMarker();

    if (!markersRef.current.driver) {
      markersRef.current.driver = L.marker(
        [order.mitra_lat, order.mitra_lng],
        { icon, title: "Lokasi Mitra" }
      )
        .addTo(map)
        .bindPopup("Mitra");
    } else {
      markersRef.current.driver.setLatLng([order.mitra_lat, order.mitra_lng]);
    }
  }, [order?.mitra_lat, order?.mitra_lng]);

  // ========= CUSTOMER MARKER =========
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !customerLocation) return;

    const icon = getDefaultMarker();

    if (!markersRef.current.customer) {
      markersRef.current.customer = L.marker(
        [customerLocation.lat, customerLocation.lng],
        { icon, title: "Lokasi Anda" }
      )
        .addTo(map)
        .bindPopup("Anda");
    } else {
      markersRef.current.customer.setLatLng([
        customerLocation.lat,
        customerLocation.lng,
      ]);
    }
  }, [customerLocation]);

  // ========= FIT BOUNDS WHEN BOTH POINTS EXIST =========
  useEffect(() => {
    const map = mapRef.current;
    const driver = markersRef.current.driver;
    const customer = markersRef.current.customer;

    if (map && driver && customer) {
      const bounds = L.latLngBounds([driver.getLatLng(), customer.getLatLng()]);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [order?.mitra_lat, order?.mitra_lng, customerLocation]);

  return (
    <div style={{ padding: "20px", display: "grid", gap: "16px" }}>
      <div>
        <h2>Status Pesanan</h2>
        <h3>{statusText}</h3>
        <p>{locationStatus}</p>
      </div>

      <div
        id="tracking-map"
        style={{ width: "100%", height: "320px", borderRadius: "12px" }}
      />

      {order?.mitra_lat && (
        <p>
          Mitra bergerak: {order.mitra_lat}, {order.mitra_lng}
        </p>
      )}

      {customerLocation && (
        <p>
          Lokasi Anda: {customerLocation.lat}, {customerLocation.lng}
        </p>
      )}

      {String(locationStatus || "").toLowerCase().includes("ditolak") && (
        <div style={{ color: "#c1121f" }}>
          Akses lokasi diperlukan untuk menampilkan posisi Anda. Silakan
          aktifkan kembali izin lokasi pada browser/perangkat.
        </div>
      )}

      {order?.overtime_minutes > 0 && (
        <p>
          <b>Overtime: </b>
          {order.overtime_minutes} menit (Rp {order.overtime_price})
        </p>
      )}
    </div>
  );
}
