import { randomUUID } from "node:crypto";

import dotenv from "./dotenv.mjs";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

for (const [name, value] of [
  ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
  ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", publishableKey],
  ["SUPABASE_SECRET_KEY", secretKey],
]) {
  if (!value) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
}

const publicClient = createClient(supabaseUrl, publishableKey, { auth: { persistSession: false } });
const privilegedClient = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });
let leadId;
let communicationEventId;
const runId = randomUUID();
const publicLeadSource = `rls_access_check_public_${runId}`;
const publicActivityNote = `RLS blocked public activity ${runId}`;
const publicReminderTitle = `RLS blocked public reminder ${runId}`;

function fail(message, error) {
  throw new Error(error ? `${message}: ${error.message}` : message);
}

async function requirePrivilegedRow(table, id, columns = "id") {
  const { data, error } = await privilegedClient.from(table).select(columns).eq("id", id).single();
  if (error || !data) fail(`Privileged read failed for ${table}`, error);
  return data;
}

async function requirePublicReadDenied(table, id) {
  const { data, error } = await publicClient.from(table).select("id").eq("id", id);
  if (!error && (data?.length ?? 0) !== 0) fail(`SERIOUS WARNING: publishable-key read exposed ${table}`);
  console.log(`${table}: publishable-key read denied.`);
}

async function requirePublicInsertDenied(table, payload, verificationColumn, verificationValue) {
  await publicClient.from(table).insert(payload).select("id");

  const { data: inserted, error } = await privilegedClient
    .from(table)
    .select("id")
    .eq(verificationColumn, verificationValue);
  if (error) fail(`Privileged insert verification failed for ${table}`, error);
  if ((inserted?.length ?? 0) > 0) {
    await privilegedClient.from(table).delete().in("id", inserted.map((row) => row.id));
    fail(`SERIOUS WARNING: publishable-key insert succeeded for ${table}`);
  }

  console.log(`${table}: publishable-key insert denied.`);
}

async function requirePublicMutationDenied(table, id, update, verificationColumn, expectedValue) {
  const { data: updated, error: updateError } = await publicClient.from(table).update(update).eq("id", id).select("id");
  if (!updateError && (updated?.length ?? 0) !== 0) fail(`SERIOUS WARNING: publishable-key update succeeded for ${table}`);

  const { data: deleted, error: deleteError } = await publicClient.from(table).delete().eq("id", id).select("id");
  if (!deleteError && (deleted?.length ?? 0) !== 0) fail(`SERIOUS WARNING: publishable-key delete succeeded for ${table}`);

  const preserved = await requirePrivilegedRow(table, id, `id, ${verificationColumn}`);
  if (preserved[verificationColumn] !== expectedValue) fail(`SERIOUS WARNING: publishable-key update changed ${table}`);
  console.log(`${table}: publishable-key update and delete denied.`);
}

try {
  const { data: lead, error: leadError } = await privilegedClient
    .from("leads")
    .insert({ first_name: "RLS", last_name: "Verification", phone: "5555550100", source: `rls_access_check_${runId}` })
    .select("id")
    .single();
  if (leadError || !lead) fail("Privileged lead insert failed", leadError);
  leadId = lead.id;

  const { data: activity, error: activityError } = await privilegedClient
    .from("lead_activities")
    .insert({ lead_id: leadId, type: "note", note: "RLS verification fixture" })
    .select("id")
    .single();
  if (activityError || !activity) fail("Privileged activity insert failed", activityError);

  const { data: reminder, error: reminderError } = await privilegedClient
    .from("lead_reminders")
    .insert({ lead_id: leadId, title: "RLS verification fixture", due_at: new Date(Date.now() + 3600000).toISOString() })
    .select("id")
    .single();
  if (reminderError || !reminder) fail("Privileged reminder insert failed", reminderError);

  const { data: communicationEvent, error: communicationEventError } = await privilegedClient
    .from("communication_events")
    .insert({
      lead_id: leadId,
      event_type: "manual_note",
      direction: "internal",
      body: "RLS verification communication event",
      created_source: "rls_access_check",
    })
    .select("id")
    .single();
  if (communicationEventError || !communicationEvent) fail("Privileged communication event insert failed", communicationEventError);
  communicationEventId = communicationEvent.id;

  await requirePrivilegedRow("leads", leadId);
  await requirePrivilegedRow("lead_activities", activity.id);
  await requirePrivilegedRow("lead_reminders", reminder.id);
  await requirePrivilegedRow("communication_events", communicationEventId);
  console.log("Privileged CRM inserts and reads succeeded.");

  await requirePublicReadDenied("leads", leadId);
  await requirePublicReadDenied("lead_activities", activity.id);
  await requirePublicReadDenied("lead_reminders", reminder.id);
  await requirePublicReadDenied("communication_events", communicationEventId);

  await requirePublicInsertDenied(
    "leads",
    { first_name: "Blocked", phone: "5555550101", source: publicLeadSource },
    "source",
    publicLeadSource,
  );
  await requirePublicInsertDenied(
    "lead_activities",
    { lead_id: leadId, type: "note", note: publicActivityNote },
    "note",
    publicActivityNote,
  );
  await requirePublicInsertDenied(
    "lead_reminders",
    { lead_id: leadId, title: publicReminderTitle, due_at: new Date().toISOString() },
    "title",
    publicReminderTitle,
  );
  await requirePublicInsertDenied(
    "communication_events",
    { lead_id: leadId, event_type: "manual_note", direction: "internal", body: publicActivityNote, created_source: "rls_access_check_public" },
    "body",
    publicActivityNote,
  );

  await requirePublicMutationDenied("leads", leadId, { status: "lost" }, "status", "new");
  await requirePublicMutationDenied("lead_activities", activity.id, { note: "Blocked update" }, "note", "RLS verification fixture");
  await requirePublicMutationDenied("lead_reminders", reminder.id, { completed: true }, "completed", false);
  await requirePublicMutationDenied(
    "communication_events",
    communicationEventId,
    { body: "Blocked update" },
    "body",
    "RLS verification communication event",
  );

  const { data: updatedLead, error: privilegedUpdateError } = await privilegedClient
    .from("leads")
    .update({ status: "contacted" })
    .eq("id", leadId)
    .select("id")
    .single();
  if (privilegedUpdateError || !updatedLead) fail("Privileged CRM update failed", privilegedUpdateError);
  console.log("Privileged CRM update succeeded.");

  console.log("CRM RLS access check passed.");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  if (leadId !== undefined) {
    const { error } = await privilegedClient.from("leads").delete().eq("id", leadId);
    if (error) {
      console.error("Privileged fixture cleanup failed:", error.message);
      process.exitCode = 1;
    } else {
      console.log("Privileged CRM delete and fixture cleanup succeeded.");
    }
  }
}
