import { supabaseAdmin } from "../_supabaseClient.js";
import { appendTimeline } from "../_orderHelpers.js";
import { parseBody, requireCustomer, sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { success: false, message: "Method not allowed" });
  }

  const customerId = requireCustomer(req);
  if (!customerId) {
    return sendJson(res, 401, { success: false, message: "Unauthorized" });
  }

  const body = await parseBody(req);
  const { payment_id, note } = body;

  if (!payment_id) {
    return sendJson(res, 400, { success: false, message: "payment_id required" });
  }

  const { data: payment, error: paymentErr } = await supabaseAdmin
    .from("payments")
    .select("*, orders!inner(id, customer_id, status)")
    .eq("id", payment_id)
    .single();

  if (paymentErr || !payment || payment.orders.customer_id !== customerId) {
    return sendJson(res, 404, { success: false, message: "Invoice tidak ditemukan" });
  }

  const { error } = await supabaseAdmin
    .from("payments")
    .update({
      status: "pending_verification",
      proof_url: note || payment.proof_url,
    })
    .eq("id", payment_id);

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  await appendTimeline(
    payment.order_id,
    payment.orders.status,
    payment.orders.status,
    "CUSTOMER",
    customerId,
    "Customer requested manual payment review"
  );

  return sendJson(res, 200, { success: true, status: "pending_verification" });
}
