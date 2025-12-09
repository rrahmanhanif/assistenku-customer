import { supabase } from "./supabase";

export function subscribePayment(orderId, callback) {
  return supabase
    .channel("payment-" + orderId)
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
