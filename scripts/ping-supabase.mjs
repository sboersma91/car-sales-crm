import dotenv from "./dotenv.mjs";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

if (!publishableKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, publishableKey);

const { data, error } = await supabase.from("health_check").select("*").limit(1);

if (error) {
  console.error("Supabase ping failed:", error.message);
  process.exit(1);
}

console.log("Supabase ping succeeded.");
console.log("health_check rows returned:", data?.length ?? 0);
