import { supabase } from "../../lib/supabase";

export async function updateCustomerRating(ratingId, newRating, newReview) {
  const { data, error } = await supabase
    .from("ratings")
    .update({
      rating: newRating,
      review: newReview
    })
    .eq("id", ratingId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
