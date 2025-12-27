// src/lib/overtimeRealtime.js
import { supabase } from "./supabase";

export function subscribeOvertime(orderId, callback) {
  return supabase
    .channel(`overtime-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "overtime_requests",
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}
