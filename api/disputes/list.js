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

  const { data, error } = await supabaseAdmin
    .from("disputes")
    .select("*, orders!inner(customer_id)")
    .eq("orders.customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  return sendJson(res, 200, { success: true, disputes: data || [] });
}
