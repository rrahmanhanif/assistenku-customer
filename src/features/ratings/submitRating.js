import { supabase } from "../../lib/supabase";

export async function submitCustomerRating({ orderId, mitraId, rating, review }) {
  const { data, error } = await supabase
    .from("ratings")
    .insert({
      order_id: orderId,
      customer_id: (await supabase.auth.getUser()).data.user.id,
      mitra_id: mitraId,
      rating,
      review
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
