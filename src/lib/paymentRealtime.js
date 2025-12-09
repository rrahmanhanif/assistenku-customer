// src/lib/paymentRealtime.js
import { supabase } from "./supabase";

export function subscribePayment(orderId, callback) {
  const channel = supabase
    .channel(`payment_${orderId}`)
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

  return channel;
}
