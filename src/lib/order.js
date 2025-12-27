import { supabase } from "./supabase";

/* ===============================
   1. Ambil semua order customer
   =============================== */
export async function getOrders(customerId) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error getOrders:", err);
    return [];
  }
}

/* ===============================
   2. Ambil detail order
   =============================== */
export async function getOrderById(orderId) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error getOrderById:", err);
    return null;
  }
}

/* ===============================
   3. Buat pesanan baru (Final versi 8.4)
   =============================== */
export async function createOrder(payload) {
  try {
    const basePrice = payload.base_price || 0;
    const surgePrice = payload.surge_price || 0;
    const overtimePrice = payload.overtime_price || 0;

    const subtotal = basePrice + surgePrice + overtimePrice;
    const platformFee = Math.round(subtotal * 0.05);

    const totalPrice =
      typeof payload.total_price === "number"
        ? payload.total_price
        : subtotal + platformFee;

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_id: payload.customer_id,
          customer_name: payload.customer_name,
          customer_address: payload.customer_address || "",

          service_id: payload.service_id,
          service_name: payload.service_name,

          base_price: basePrice,
          surge_price: surgePrice,
          overtime_price: overtimePrice,
          platform_fee: platformFee,

          total_price: totalPrice,

          status: "MENUNGGU_KONFIRMASI",
          payment_status: payload.payment_status || "UNPAID",
          payment_method: payload.payment_method || "none",
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error("Error createOrder:", err?.message || err);
    return null;
  }
}

/* ===============================
   4. Update order
   =============================== */
export async function updateOrder(orderId, updates) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error updateOrder:", err);
    return null;
  }
}

/* ===============================
   5. Hapus order
   =============================== */
export async function deleteOrder(orderId) {
  try {
    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error deleteOrder:", err);
    return false;
  }
}
