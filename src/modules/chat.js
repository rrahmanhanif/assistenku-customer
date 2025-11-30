import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vptfubypmfafrnmwweyj.supabase.co",
  "YOUR_ANON_KEY"
);

// kirim pesan
export async function sendMessage(orderId, sender, message) {
  return supabase.from("messages").insert([
    { order_id: orderId, sender, message }
  ]);
}

// subscribe chat realtime
export function subscribeChat(orderId, callback) {
  return supabase
    .channel(`chat-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `order_id=eq.${orderId}`
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
}
