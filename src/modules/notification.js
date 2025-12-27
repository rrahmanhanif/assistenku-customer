import { supabase } from "../lib/supabase";

// callback akan dipanggil ketika ada pesan masuk dari mitra
export function listenCustomerNotification(customerId, callback) {
  return supabase
    .channel(`notif-customer-${customerId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `sender=eq.mitra`,
      },
      (payload) => {
        callback({
          order_id: payload.new.order_id,
          message: payload.new.message,
          sender: payload.new.sender,
        });
      }
    )
    .subscribe();
}
