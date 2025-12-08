// src/lib/chat.js
import { supabase } from "./supabase";

// ------------------------------
// SEND CHAT MESSAGE
// ------------------------------
export async function sendChatMessage(payload) {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert([
      {
        order_id: payload.order_id,
        sender_type: payload.sender_type, // "customer" / "mitra"
        sender_id: payload.sender_id,
        message: payload.message,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Send chat error:", error);
    return null;
  }

  return data;
}

// ------------------------------
// GET CHAT HISTORY
// ------------------------------
export async function getChat(orderId) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Get chat error:", error);
    return [];
  }

  return data || [];
}

// ------------------------------
// REALTIME CHAT LISTENER
// ------------------------------
export function subscribeChat(orderId, callback) {
  const channel = supabase
    .channel(`chat_room_${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        if (payload.new) callback(payload.new);
      }
    )
    .subscribe();

  return channel;
}
