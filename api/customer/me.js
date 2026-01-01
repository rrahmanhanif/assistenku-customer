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

  const { data: customer, error } = await supabaseAdmin
    .from("customers")
    .select("*, customer_addresses(*)")
    .eq("id", customerId)
    .single();

  if (error || !customer) {
    return sendJson(res, 404, { success: false, message: "Customer not found" });
  }

  return sendJson(res, 200, { success: true, customer });
}
