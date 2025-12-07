// src/lib/order.js

import { supabase } from "./supabaseClient";

// Ambil semua order berdasarkan userId
export async function getOrders(userId) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("userId", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error getOrders:", err);
    return [];
  }
}

// Ambil detail satu order berdasarkan ID
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

// Buat order baru
export async function createOrder(orderData) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error createOrder:", err);
    return null;
  }
}

// Update order
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

// Hapus order
export async function deleteOrder(orderId) {
  try {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error deleteOrder:", err);
    return false;
  }
}
