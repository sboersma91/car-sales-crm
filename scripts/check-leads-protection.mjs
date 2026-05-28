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

const { error: healthError } = await supabase.from("health_check").select("*").limit(1);
if (healthError) {
  console.error("Connection check failed via health_check:", healthError.message);
  process.exit(1);
}

const { error: leadsSelectError } = await supabase.from("leads").select("id").limit(1);
if (leadsSelectError) {
  const missingTable =
    leadsSelectError.code === "42P01" || leadsSelectError.message.toLowerCase().includes("does not exist");

  if (missingTable) {
    console.error("Leads table is missing.");
  } else {
    console.error("Leads select check failed:", leadsSelectError.message);
  }
  process.exit(1);
}

const payload = {
  first_name: "Protection",
  last_name: "Check",
  source: "stage_0d_protection_check",
  status: "new",
};

const { data: insertedRows, error: insertError } = await supabase
  .from("leads")
  .insert(payload)
  .select("id, source")
  .limit(1);

if (insertError) {
  console.log("Leads public insert blocked as expected.");
  process.exit(0);
}

console.error("SERIOUS WARNING: Leads public insert succeeded with publishable key.");

const insertedId = insertedRows?.[0]?.id;
if (insertedId !== undefined && insertedId !== null) {
  const { error: cleanupError } = await supabase.from("leads").delete().eq("id", insertedId);
  if (cleanupError) {
    console.error("Cleanup delete failed for inserted test row:", cleanupError.message);
  } else {
    console.error("Cleanup delete succeeded for inserted test row.");
  }
} else {
  const { error: cleanupBySourceError } = await supabase
    .from("leads")
    .delete()
    .eq("source", "stage_0d_protection_check")
    .eq("first_name", "Protection")
    .eq("last_name", "Check");

  if (cleanupBySourceError) {
    console.error("Cleanup delete attempt by source/first_name/last_name failed:", cleanupBySourceError.message);
  } else {
    console.error("Cleanup delete attempt by source/first_name/last_name succeeded.");
  }
}

process.exit(1);
