import { supabaseAdmin } from "../_supabaseClient.js";
import { extractQuery, requireCustomer, sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { success: false, message: "Method not allowed" });
  }

  const customerId = requireCustomer(req);
  if (!customerId) {
    return sendJson(res, 401, { success: false, message: "Unauthorized" });
  }

  const params = extractQuery(req.url || "");
  const orderId = params.get("order_id");
  if (!orderId) {
    return sendJson(res, 400, { success: false, message: "order_id required" });
  }

  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .select("id,order_id,sender_role,sender_id,message_text,created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  return sendJson(res, 200, { success: true, messages: data });
}
