import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase Credentials. Check your .env file in apps/api/");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log("✅ Supabase client initialized");
