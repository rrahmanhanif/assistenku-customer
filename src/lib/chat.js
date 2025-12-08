// src/lib/chat.js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// Kirim pesan
export async function sendMessage(orderId, sender, message) {
  const { error } = await supabase.from("messages").insert([
    {
      order_id: orderId,
      sender,
      message,
      created_at: new Date(),
    },
  ]);

  return !error;
}

// Subscribe pesan realtime
export function subscribeChat(orderId, onMessage) {
  const channel = supabase
    .channel(`chat_${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        onMessage(payload.new);
      }
    )
    .subscribe();

  return channel;
}
