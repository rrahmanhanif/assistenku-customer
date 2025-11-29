import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function sendMessage(orderId, sender, message) {
  return supabase.from("messages").insert([
    {
      order_id: orderId,
      sender,
      message,
      created_at: new Date().toISOString(),
    },
  ]);
}

export function subscribeChat(orderId, callback) {
  return supabase
    .channel(`chat-order-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}
