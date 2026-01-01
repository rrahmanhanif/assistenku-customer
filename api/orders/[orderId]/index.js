import { supabaseAdmin } from "../../_supabaseClient.js";
import { buildOrderSelect } from "../../_orderHelpers.js";
import { pathParam, requireCustomer, sendJson } from "../../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
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

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(buildOrderSelect())
    .eq("id", orderId)
    .eq("customer_id", customerId)
    .single();

  if (error) {
    return sendJson(res, 404, { success: false, message: "Order not found" });
  }

  return sendJson(res, 200, { success: true, order: data });
}
