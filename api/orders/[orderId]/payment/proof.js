import { supabaseAdmin } from "../../../_supabaseClient.js";
import { appendTimeline } from "../../../_orderHelpers.js";
import { parseBody, pathParam, requireCustomer, sendJson } from "../../../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { success: false, message: "Method not allowed" });
  }

  const customerId = requireCustomer(req);
  if (!customerId) {
    return sendJson(res, 401, { success: false, message: "Unauthorized" });
  }

  const orderId = req.query?.orderId || pathParam(req, "orderId");
  if (!orderId) {
    return sendJson(res, 400, { success: false, message: "Missing order id" });
  }

  const { payment_id, proof_url } = await parseBody(req);
  if (!payment_id || !proof_url) {
    return sendJson(res, 400, {
      success: false,
      message: "payment_id and proof_url required",
    });
  }

  const { data: existing } = await supabaseAdmin
    .from("orders")
    .select("status, customer_id")
    .eq("id", orderId)
    .single();

  if (!existing || existing.customer_id !== customerId) {
    return sendJson(res, 404, { success: false, message: "Order not found" });
  }

  const { error } = await supabaseAdmin
    .from("payments")
    .update({ proof_url, status: "pending" })
    .eq("id", payment_id)
    .eq("order_id", orderId);

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  await appendTimeline(
    orderId,
    existing.status,
    "COMPLETED_PENDING_PAYMENT",
    "CUSTOMER",
    customerId,
    "Customer mengunggah bukti bayar"
  );

  return sendJson(res, 200, { success: true });
}
