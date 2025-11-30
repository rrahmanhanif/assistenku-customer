import supabase from "../lib/supabaseClient";

let lastSend = 0; // anti-spam

export function startCustomerGPS(customerId, customerName) {
  if (!navigator.geolocation) {
    console.error("GPS not supported");
    return;
  }

  navigator.geolocation.watchPosition(
    async (pos) => {
      const now = Date.now();

      // ⛔ Anti-spam: kirim minimal 10 detik sekali
      if (now - lastSend < 10000) return;
      lastSend = now;

      const { latitude, longitude } = pos.coords;

      await supabase.from("realtime_gps").upsert(
        {
          user_id: customerId,
          name: customerName,
          role: "customer",
          lat: latitude,
          lng: longitude,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    },
    (err) => console.error("GPS error:", err),
    { enableHighAccuracy: true }
  );
}
