// src/lib/order.js
import supabase from "./supabaseClient";

/**
 * Membuat order baru di tabel 'orders'
 * @param {Object} data - Data pesanan
 * @returns {Object|null} - Data order baru atau null jika gagal
 */
export async function createOrder(data) {
  try {
    const { data: newOrder, error } = await supabase
      .from("orders")
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error("ERROR:createOrder =>", error);
      return null;
    }

    return newOrder;
  } catch (err) {
    console.error("FATAL ERROR:createOrder =>", err);
    return null;
  }
}
