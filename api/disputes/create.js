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

  const { order_id, category, description } = await parseBody(req);
  if (!order_id || !description) {
    return sendJson(res, 400, {
      success: false,
      message: "order_id and description required",
    });
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("status, customer_id")
    .eq("id", order_id)
    .single();

  if (!order || order.customer_id !== customerId) {
    return sendJson(res, 404, { success: false, message: "Order not found" });
  }

  const { data, error } = await supabaseAdmin
    .from("disputes")
    .insert({ order_id, customer_id: customerId, category, description })
    .select()
    .single();

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  await appendTimeline(
    order_id,
    order.status,
    order.status,
    "CUSTOMER",
    customerId,
    "Customer membuat dispute"
  );

  return sendJson(res, 201, { success: true, dispute: data });
}
