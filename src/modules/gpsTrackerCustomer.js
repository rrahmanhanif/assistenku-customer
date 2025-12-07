// src/modules/gpsTrackerCustomer.js
import { supabase } from "../lib/supabaseClient";

export const getGpsLocation = async (orderId) => {
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
};

  navigator.geolocation.watchPosition(
    async (pos) => {
      const now = Date.now();
      if (now - lastSend < 10000) return;
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

      if (error) console.error("SUPABASE ERROR:", error);
    },
    (err) => console.error("GPS ERROR:", err),
    { enableHighAccuracy: true }
  );
}
