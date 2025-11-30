import supabase from "./supabaseClient";

let lastChat = 0; // anti spam chat

export async function sendMessage(orderId, sender, message) {
  const now = Date.now();

  if (now - lastChat < 3000) {
    return { error: "Terlalu cepat, tunggu 3 detik." };
  }

  lastChat = now;

  return await supabase.from("messages").insert([
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
