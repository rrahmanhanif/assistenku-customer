import { supabase } from "../lib/supabaseClient";

export async function startCustomerGPS(orderId) {
  if (!("geolocation" in navigator)) {
    console.error("GPS tidak tersedia");
    return;
  }

  navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;

      await supabase
        .from("customer_locations")
        .upsert({
          order_id: orderId,
          latitude,
          longitude,
          updated_at: new Date().toISOString(),
        });
    },
    (err) => console.error("Error GPS:", err),
    { enableHighAccuracy: true }
  );
}
