// src/lib/orderService.js
import { supabase } from "./supabase";

export async function createOrder(data) {
  const { data: insertData, error } = await supabase
    .from("orders")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Error creating order:", error);
    return null;
  }

  return insertData;
}
