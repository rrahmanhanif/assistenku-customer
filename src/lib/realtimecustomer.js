// src/lib/realtimeCustomer.js
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function subscribeOrderStatus(orderId, callback) {
  return supabase
    .channel(`order-status-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}
