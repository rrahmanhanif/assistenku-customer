import { createClient } from "@supabase/supabase-js";

// Gunakan ENV versi Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validasi agar tidak error saat npm run dev
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ ENV Supabase tidak ditemukan!");
  console.error("Pastikan .env sudah dibuat dan berisi:");
  console.error("VITE_SUPABASE_URL=....");
  console.error("VITE_SUPABASE_ANON_KEY=....");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
