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

  const { amount, method = "manual_transfer" } = await parseBody(req);
  if (!amount) {
    return sendJson(res, 400, { success: false, message: "Amount is required" });
  }

  const { data: existing } = await supabaseAdmin
    .from("orders")
    .select("status, customer_id")
    .eq("id", orderId)
    .single();

  if (!existing || existing.customer_id !== customerId) {
    return sendJson(res, 404, { success: false, message: "Order not found" });
  }

  const { data, error } = await supabaseAdmin
    .from("payments")
    .insert({
      order_id: orderId,
      amount,
      method,
      status: "pending",
      invoice_no: `INV-${Date.now()}`,
    })
    .select()
    .single();

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  await appendTimeline(
    orderId,
    existing.status,
    "COMPLETED_PENDING_PAYMENT",
    "CUSTOMER",
    customerId,
    "Invoice dibuat customer"
  );

  return sendJson(res, 201, { success: true, payment: data });
}
