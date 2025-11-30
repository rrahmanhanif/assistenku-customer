import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON
);

// ======================================================
// LISTENER UNTUK POSISI MITRA (REALTIME)
// ======================================================
export function subscribeMitraLocation(orderId, callback) {
  return supabase
    .channel(`gps-mitra-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "gps_mitra",
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        const data = payload.new;
        callback({
          lat: data.latitude,
          lng: data.longitude,
          time: data.created_at,
        });
      }
    )
    .subscribe();
}
