// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// =============================
// CONFIG SUPABASE — FINAL
// =============================

const supabaseUrl = "https://vptfubypmfafrnmwweyj.supabase.co";

// ANON KEY (public) — diizinkan Supabase untuk Frontend
// Kamu sudah memberikan ini sebelumnya, dan ini versi AMAN untuk Client-side.
const supabaseAnonKey = `
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdGZ1YnlwbWZhZnJubXd3ZXlqIiwicm9sZSI6ImFub24iLCJleHAiOjE5OTUwMDA4MDB9.
h3D1uz8y8nNRR8WUZtFzNEp0SbLjj6Fex2dzU9uTcuM
`.trim();

// =============================
// CLIENT CREATION
// =============================

// Realtime, RLS, Storage, dan RPC semua aktif otomatis.
// Tidak perlu options tambahan.
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      "x-assistenku-app": "customer",   // tanda aplikasi (Gojek juga pakai cara ini)
    },
  },
});

// =============================
// EXPORT
// =============================
export default supabase;
