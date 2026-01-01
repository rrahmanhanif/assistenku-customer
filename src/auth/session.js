import { supabase } from "../lib/supabase";

export async function refreshSessionToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  const token = data.session?.access_token;
  if (token) {
    localStorage.setItem("customer_token", token);
  }
  return token;
}

export async function ensureSession() {
  const token = localStorage.getItem("customer_token");
  if (token) return token;
  return refreshSessionToken();
}
