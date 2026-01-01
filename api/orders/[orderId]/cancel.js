import { supabaseAdmin } from "../../_supabaseClient.js";
import { appendTimeline } from "../../_orderHelpers.js";
import { pathParam, requireCustomer, sendJson } from "../../_utils.js";

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

  const { data: existing } = await supabaseAdmin
    .from("orders")
    .select("status, customer_id")
    .eq("id", orderId)
    .single();

  if (!existing || existing.customer_id !== customerId) {
    return sendJson(res, 404, { success: false, message: "Order not found" });
  }

  if (["IN_PROGRESS", "EVIDENCE_SUBMITTED", "PAID", "CLOSED"].includes(existing.status)) {
    return sendJson(res, 400, { success: false, message: "Pesanan tidak bisa dibatalkan" });
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "CANCELLED" })
    .eq("id", orderId);

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  await appendTimeline(
    orderId,
    existing.status,
    "CANCELLED",
    "CUSTOMER",
    customerId,
    "Customer membatalkan pesanan"
  );

  return sendJson(res, 200, { success: true });
}
