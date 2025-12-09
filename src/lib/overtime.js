import { supabase } from "./supabase";

/**
 * MITRA mengajukan overtime
 */
export async function requestOvertime(orderId, customerId, mitraId, minutes = 15) {
  const pricePer15 = 15000;
  const totalPrice = (minutes / 15) * pricePer15;

  const { data, error } = await supabase
    .from("overtime_requests")
    .insert({
      order_id: orderId,
      customer_id: customerId,
      mitra_id: mitraId,
      requested_minutes: minutes,
      total_price: totalPrice,
      status: "PENDING",
    })
    .select()
    .single();

  return { data, error };
}

/**
 * CUSTOMER menyetujui overtime
 */
export async function approveOvertime(requestId) {
  // 1) ambil data request
  const { data: req, error: loadErr } = await supabase
    .from("overtime_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (loadErr) return { error: loadErr };

  // 2) ubah status request → ACCEPTED
  const { error: errReq } = await supabase
    .from("overtime_requests")
    .update({
      status: "ACCEPTED",
      approved_at: new Date(),
    })
    .eq("id", requestId);

  if (errReq) return { error: errReq };

  // 3) update orders (SQL trigger juga ikut update final_price)
  const { error: errOrder } = await supabase
    .from("orders")
    .update({
      overtime_minutes: req.requested_minutes,
      overtime_price: req.total_price,
    })
    .eq("id", req.order_id);

  return { data: req, error: errOrder };
}

/**
 * CUSTOMER menolak overtime
 */
export async function rejectOvertime(requestId) {
  const { error } = await supabase
    .from("overtime_requests")
    .update({
      status: "REJECTED",
    })
    .eq("id", requestId);

  return { error };
    }
