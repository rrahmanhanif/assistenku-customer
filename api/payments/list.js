import { supabaseAdmin } from "../_supabaseClient.js";
import { requireCustomer, sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { success: false, message: "Method not allowed" });
  }

  const customerId = requireCustomer(req);
  if (!customerId) {
    return sendJson(res, 401, { success: false, message: "Unauthorized" });
  }

  const { data: orders, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id, status, service_id, price_estimate, final_price")
    .eq("customer_id", customerId);

  if (orderError) {
    return sendJson(res, 500, { success: false, message: orderError.message });
  }

  const orderIds = (orders || []).map((o) => o.id);
  if (orderIds.length === 0) {
    return sendJson(res, 200, { success: true, payments: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("*, order:orders(id,status,service_id,price_estimate,final_price)")
    .in("order_id", orderIds)
    .order("created_at", { ascending: false });

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  return sendJson(res, 200, { success: true, payments: data || [] });
}
