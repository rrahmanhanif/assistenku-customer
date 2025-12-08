import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Ambil semua layanan aktif dari Supabase
 */
export async function getServices() {
  const { data, error } = await supabase
    .from("services_master")
    .select("*")
    .eq("active", true)
    .order("service_name", { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }

  return data;
}

/**
 * Ambil detail 1 layanan berdasarkan service_code
 */
export async function getServiceDetail(serviceCode) {
  const { data, error } = await supabase
    .from("services_master")
    .select("*")
    .eq("service_code", serviceCode)
    .single();

  if (error) {
    console.error("Error fetching service detail:", error);
    return null;
  }

  return data;
}
