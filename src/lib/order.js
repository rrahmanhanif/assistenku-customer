import { supabase } from "./supabaseClient";

// Buat pesanan baru dari Customer
export async function createOrder({ customer_id, customer_name, total_price }) {
  const { data, error } = await supabase
    .from("orders")
    .insert([
      {
        customer_id,
        customer_name,
        total_price,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error create order:", error);
    return null;
  }

  return data;
}
