import dotenv from "./dotenv.mjs";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

if (!secretKey) {
  console.error("Missing SUPABASE_SECRET_KEY");
  process.exit(1);
}

try {
  const supabase = createClient(supabaseUrl, secretKey);

  const payload = {
    name: "Server Insert Test",
    source: "stage_0e_server_insert_test",
    status: "new",
    notes: "Created by Stage 0E server insert test script",
  };

  const { data: insertedRows, error: insertError } = await supabase
    .from("leads")
    .insert(payload)
    .select("id")
    .limit(1);

  if (insertError) {
    console.error("Server-side lead insert failed:", insertError.message);
    process.exit(1);
  }

  const insertedId = insertedRows?.[0]?.id;
  if (!insertedId) {
    console.error("Stage 0E server insert test failed before completion.", "Missing inserted row id.");
    process.exit(1);
  }

  console.log("Server-side lead insert succeeded.");

  const { error: cleanupError } = await supabase.from("leads").delete().eq("id", insertedId);

  if (cleanupError) {
    console.error("Server-side lead cleanup failed:", cleanupError.message);
    process.exit(1);
  }

  console.log("Server-side lead cleanup succeeded.");
  console.log("Stage 0E server insert test passed.");
  process.exit(0);
} catch (error) {
  console.error(
    "Stage 0E server insert test failed before completion.",
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
}
