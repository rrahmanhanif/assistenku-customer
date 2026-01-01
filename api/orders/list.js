import { supabaseAdmin } from "../_supabaseClient.js";
import { extractQuery, requireCustomer, sendJson } from "../_utils.js";

const ACTIVE_STATUSES = [
  "ORDER_CREATED",
  "WAITING_ASSIGNMENT",
  "ASSIGNED",
  "MITRA_ON_ROUTE",
  "IN_PROGRESS",
  "EVIDENCE_SUBMITTED",
  "NEEDS_REVISION",
  "COMPLETED_PENDING_PAYMENT",
];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { success: false, message: "Method not allowed" });
  }

  const customerId = requireCustomer(req);
  if (!customerId) {
    return sendJson(res, 401, { success: false, message: "Unauthorized" });
  }

  const query = extractQuery(req.url);
  const scope = query.get("scope");

  let filter = supabaseAdmin
    .from("orders")
    .select(
      "id,status,price_estimate,final_price,created_at,updated_at,service_id,address_text,schedule_at,services(name)"
    )
    .eq("customer_id", customerId);

  if (scope === "active") {
    filter = filter.in("status", ACTIVE_STATUSES);
  }

  if (scope === "history") {
    filter = filter.not(
      "status",
      "in",
      `(${ACTIVE_STATUSES.map((s) => `'${s}'`).join(",")})`
    );
  }

  const { data, error } = await filter.order("updated_at", { ascending: false });

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  return sendJson(res, 200, { success: true, orders: data });
}
