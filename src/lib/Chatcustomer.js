import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function sendMessage(orderId, sender, message) {
  return supabase
    .from("messages")
    .insert([{ order_id: orderId, sender, message }]);
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
        filter: `order_id=eq.${orderId}`
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}
