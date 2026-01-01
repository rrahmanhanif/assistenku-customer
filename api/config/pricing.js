import { supabaseAdmin } from "../_supabaseClient.js";
import { sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { success: false, message: "Method not allowed" });
  }

  const { data, error } = await supabaseAdmin
    .from("services")
    .select("id, base_price, pricing_rules_json, updated_at")
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  const version =
    data && data.length > 0 ? data[0].updated_at : new Date().toISOString();

  return sendJson(res, 200, {
    success: true,
    pricing_version: version,
    items: data || [],
  });
}
