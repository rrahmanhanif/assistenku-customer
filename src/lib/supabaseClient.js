import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vptfubypmfafrnmwweyj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc...zmw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
