import { supabaseAdmin } from "../_supabaseClient.js";
import { sendJson, extractQuery } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { success: false, message: "Method not allowed" });
  }

  const params = extractQuery(req.url);
  const includeInactive = params.get("include_inactive") === "true";

  let query = supabaseAdmin
    .from("services")
    .select("id,name,description,base_price,pricing_rules_json,is_active,created_at");

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query.order("name", { ascending: true });

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  return sendJson(res, 200, { success: true, services: data || [] });
}
