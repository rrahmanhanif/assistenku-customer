import supabase from "../lib/supabaseClient";

let lastSend = 0;

export function startCustomerGPS(customerId, customerName) {
  if (!navigator.geolocation) {
    console.error("GPS not supported");
    return;
  }

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
