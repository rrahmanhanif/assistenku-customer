import { supabaseAdmin } from "../_supabaseClient.js";
import { sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { success: false, message: "Method not allowed" });
  }

  const { data, error } = await supabaseAdmin
    .from("services")
    .select("id,name,description,base_price,pricing_rules_json,is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  return sendJson(res, 200, { success: true, services: data });
}
