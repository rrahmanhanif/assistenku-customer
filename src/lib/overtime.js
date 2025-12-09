import { supabase } from "./supabase";

export async function requestOvertime(orderId, customerId, mitraId, minutes = 15) {
  const pricePer15 = 15000;
  const totalPrice = (minutes / 15) * pricePer15;

  const { data, error } = await supabase
    .from("overtime_requests")
    .insert([
      {
        order_id: orderId,
        customer_id: customerId,
        mitra_id: mitraId,
        requested_minutes: minutes,
        total_price: totalPrice,
      },
    ])
    .select()
    .single();

  return { data, error };
}
