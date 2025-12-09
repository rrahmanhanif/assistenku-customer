import { supabase } from "./supabase";

export async function submitRating({ orderId, customerId, mitraId, rating, comment }) {
  // 1. Simpan rating
  const { error } = await supabase.from("ratings").insert({
    order_id: orderId,
    customer_id: customerId,
    mitra_id: mitraId,
    rating,
    comment,
  });

  if (error) return false;

  // 2. Update order status
  await supabase
    .from("orders")
    .update({
      status: "rated",
      rated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  return true;
}
