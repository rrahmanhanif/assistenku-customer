import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON
);

export async function sendMessage(orderId, sender, message) {
  return supabase.from("messages").insert([{ order_id: orderId, sender, message }]);
}

export function subscribeChat(orderId, callback) {
  return supabase
    .channel(`chat-${orderId}`)
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
