// src/lib/mitraLocation.js
import { supabase } from "./supabase";

export function subscribeMitraLocation(mitraId, callback) {
  return supabase
    .channel(`mitra-location-${mitraId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "mitra_location",
        filter: `mitra_id=eq.${mitraId}`,
      },
      (data) => callback(data.new)
    )
    .subscribe();
}
