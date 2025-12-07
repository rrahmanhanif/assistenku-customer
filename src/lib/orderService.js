// src/lib/orderService.js
import { supabase } from "./supabaseClient";

export const getOrdersByCustomer = async (customerId) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("OrderService Error:", error);
    return [];
  }

  return data;
};
