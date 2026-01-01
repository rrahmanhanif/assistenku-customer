import { supabaseAdmin } from "../_supabaseClient.js";
import { appendTimeline } from "../_orderHelpers.js";
import { parseBody, requireCustomer, sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { success: false, message: "Method not allowed" });
  }

  const customerId = requireCustomer(req);
  if (!customerId) {
    return sendJson(res, 401, { success: false, message: "Unauthorized" });
  }

  const body = await parseBody(req);
  const {
    service_id,
    address_id,
    address,
    schedule_at,
    notes,
    addons = [],
    dry_run = false,
  } = body;

  if (!service_id || (!address_id && !address)) {
    return sendJson(res, 400, {
      success: false,
      message: "Missing service_id or address",
    });
  }

  const { data: service } = await supabaseAdmin
    .from("services")
    .select("id, base_price, pricing_rules_json, is_active")
    .eq("id", service_id)
    .single();

  if (!service || service.is_active === false) {
    return sendJson(res, 404, { success: false, message: "Service tidak tersedia" });
  }

  let addressText = address;
  let addressRef = address_id;

  if (address_id) {
    const { data: addr, error: addrErr } = await supabaseAdmin
      .from("customer_addresses")
      .select("id, address_text")
      .eq("id", address_id)
      .eq("customer_id", customerId)
      .single();

    if (addrErr || !addr) {
      return sendJson(res, 400, { success: false, message: "Alamat tidak ditemukan" });
    }

    addressText = addr.address_text;
    addressRef = addr.id;
  }

  const addonsTotal = addons.reduce(
    (sum, addon) =>
      sum + Number(addon.addon_price || 0) * Number(addon.qty || 1),
    0
  );

  const price_estimate = Number(service.base_price || 0) + addonsTotal;

  if (dry_run) {
    return sendJson(res, 200, { success: true, price_estimate });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_id: customerId,
      service_id,
      address_id: addressRef,
      address_text: addressText,
      schedule_at: schedule_at ? new Date(schedule_at).toISOString() : null,
      notes,
      price_estimate,
      status: "ORDER_CREATED",
    })
    .select()
    .single();

  if (error) {
    return sendJson(res, 500, { success: false, message: error.message });
  }

  if (addons.length > 0) {
    await supabaseAdmin.from("order_addons").insert(
      addons.map((addon) => ({
        order_id: data.id,
        addon_name: addon.addon_name,
        addon_price: addon.addon_price || 0,
        qty: addon.qty || 1,
      }))
    );
  }

  await appendTimeline(
    data.id,
    null,
    "ORDER_CREATED",
    "CUSTOMER",
    customerId,
    "Pesanan dibuat oleh customer"
  );

  return sendJson(res, 201, { success: true, order: data, price_estimate });
}
