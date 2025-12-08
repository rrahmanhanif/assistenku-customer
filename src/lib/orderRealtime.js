// src/lib/orderRealtime.js
import { supabase } from "./supabase";

export function subscribeOrderStatus(orderId, callback) {
  return supabase
    .channel(`order-status-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
}
