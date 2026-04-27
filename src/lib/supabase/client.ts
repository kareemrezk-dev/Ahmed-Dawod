import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const supabase = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
);
