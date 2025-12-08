// src/lib/services.js
import { supabase } from "./supabase";

export async function getAllServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("category", { ascending: true });

  if (error) {
    console.error("Error fetch services:", error);
    return [];
  }
  return data;
}

export async function getServiceById(serviceId) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .single();

  return error ? null : data;
}
