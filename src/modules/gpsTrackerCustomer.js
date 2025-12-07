// src/modules/gpsTrackerCustomer.js

import { supabase } from "../lib/supabaseClient";

/**
 * Ambil data GPS dari database (untuk tracking mitra)
 */
export const getGpsLocation = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from("gps_tracking")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (error) {
      console.error("GPS Error:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("GPS Fetch Error:", err);
    return null;
  }
};

/**
 * Mulai GPS live tracking customer → realtime_gps table
 */
export const startCustomerLiveGps = (customerId, customerName) => {
  if (!navigator.geolocation) {
    console.error("Device tidak mendukung GPS");
    return null;
  }

  let lastSend = 0;

  const watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      try {
        const now = Date.now();
        if (now - lastSend < 10000) return; // kirim setiap 10 detik
        lastSend = now;

        const { latitude, longitude } = pos.coords;

        const { error } = await supabase.from("realtime_gps").upsert(
          {
            user_id: customerId,
            name: customerName,
            role: "customer",
            lat: latitude,
            lng: longitude,
            updated_at: new Date().toISOString()
          },
          { onConflict: "user_id" }
        );

        if (error) {
          console.error("SUPABASE ERROR:", error);
        }
      } catch (err) {
        console.error("GPS UPDATE ERROR:", err);
      }
    },
    (err) => console.error("GPS ERROR:", err),
    { enableHighAccuracy: true }
  );

  return watchId; // untuk stopTracking()
};

/**
 * Stop GPS tracking
 */
export const stopCustomerLiveGps = (watchId) => {
  try {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  } catch (err) {
    console.error("STOP GPS ERROR:", err);
  }
};

/**
 * ALIAS untuk kompatibilitas dengan App.jsx
 * Agar tidak perlu edit file lain
 */
export const startCustomerGPS = startCustomerLiveGps;
