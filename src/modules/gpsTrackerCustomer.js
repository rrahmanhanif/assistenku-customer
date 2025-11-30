import { supabase } from "../lib/supabaseClient";

export function startCustomerGPS(customerId, customerName) {
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
          customer_id: customerId,
          customer_name: customerName,
          latitude,
          longitude,
          updated_at: new Date().toISOString(),
        });
    },
    (err) => console.error("Error GPS:", err),
    { enableHighAccuracy: true }
  );
}
