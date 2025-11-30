import { supabase } from "./supabaseClient";

export async function submitRating({ order_id, customer_id, mitra_id, rating, review }) {
  return supabase
    .from("ratings")
    .insert([{ order_id, customer_id, mitra_id, rating, review }]);
}
