import { supabaseAdmin } from "./_supabaseClient.js";

export async function appendTimeline(
  orderId,
  fromStatus,
  toStatus,
  actorRole,
  actorId,
  note
) {
  return supabaseAdmin.rpc("log_order_event", {
    p_order_id: orderId,
    p_from: fromStatus,
    p_to: toStatus,
    p_role: actorRole,
    p_actor: actorId,
    p_note: note,
  });
}

export function buildOrderSelect() {
  return `*, services(*), customer_addresses!orders_address_id_fkey(*), order_addons(*), payments(*), order_timeline(*), order_evidence(*), disputes(*)`;
}
