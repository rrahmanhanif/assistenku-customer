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

  const { service_id, addons = [] } = await parseBody(req);
  if (!service_id) {
    return sendJson(res, 400, { success: false, message: "Missing service_id" });
  }

  const { data: service, error: serviceError } = await supabaseAdmin
    .from("services")
    .select("id, base_price, pricing_rules_json, is_active")
    .eq("id", service_id)
    .single();

  if (serviceError || !service || service.is_active === false) {
    return sendJson(res, 404, { success: false, message: "Service not found" });
  }

  const addonsTotal = addons.reduce(
    (sum, addon) =>
      sum + Number(addon.addon_price || 0) * Number(addon.qty || 1),
    0
  );

  const price_estimate = Number(service.base_price || 0) + addonsTotal;

  return sendJson(res, 200, {
    success: true,
    price_estimate,
    pricing_rules: service.pricing_rules_json || {},
  });
}
