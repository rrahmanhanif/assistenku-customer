import { supabaseAdmin } from "../_supabaseClient.js";
import { parseBody, requireCustomer, sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { success: false, message: "Method not allowed" });
  }

  const customerId = requireCustomer(req);
  if (!customerId) {
    return sendJson(res, 401, { success: false, message: "Unauthorized" });
  }

  const { order_id, message_text } = await parseBody(req);
  if (!order_id || !message_text) {
    return sendJson(res, 400, {
      success: false,
      message: "order_id and message_text required",
    });
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("customer_id")
    .eq("id", order_id)
    .single();

  if (!order || order.customer_id !== customerId) {
    return sendJson(res, 404, { success: false, message: "Order not found" });
  }

  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .insert({
      order_id,
      sender_role: "CUSTOMER",
      sender_id: customerId,
      message_text,
    })
    .select()
    .single();

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  return sendJson(res, 201, { success: true, message: data });
}
