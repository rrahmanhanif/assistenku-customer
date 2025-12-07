// src/lib/order.js
import { supabase } from "./supabaseClient";

/**
 * Membuat order baru untuk customer
 * @param {Object} payload 
 * { customer_id, customer_name, total_price }
 */
export async function createOrder(payload) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_id: payload.customer_id,
        customer_name: payload.customer_name,
        total_price: payload.total_price,
        status: "waiting",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error createOrder:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("❌ Fatal error createOrder:", err);
    return null;
  }
}

/**
 * Ambil detail order berdasarkan ID
 */
export async function getOrderById(orderId) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("❌ Error getOrderById:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("❌ Fatal error getOrderById:", err);
    return null;
  }
}

/**
 * Update status order
 */
export async function updateOrderStatus(orderId, newStatus) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("❌ Error updateOrderStatus:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("❌ Fatal error updateOrderStatus:", err);
    return null;
  }
}
