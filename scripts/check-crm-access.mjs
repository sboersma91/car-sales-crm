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
let conversationId;
const runId = randomUUID();
const publicLeadSource = `rls_access_check_public_${runId}`;
const publicActivityNote = `RLS blocked public activity ${runId}`;
const publicReminderTitle = `RLS blocked public reminder ${runId}`;
const publicConversationActivity = new Date(Date.now() + 86400000).toISOString();

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

  const conversationActivityAt = new Date().toISOString();
  const { data: recordedEventId, error: communicationEventError } = await privilegedClient.rpc(
    "record_outbound_sms_communication_event",
    {
      p_lead_id: leadId,
      p_occurred_at: conversationActivityAt,
      p_body: "RLS verification outbound SMS event",
      p_twilio_message_sid: `SM${runId.replaceAll("-", "")}`,
      p_twilio_status: "queued",
    },
  );
  if (communicationEventError || !recordedEventId) fail("Privileged outbound SMS event recording failed", communicationEventError);
  communicationEventId = recordedEventId;

  const { data: conversation, error: conversationError } = await privilegedClient
    .from("conversations")
    .select("id, last_activity_at")
    .eq("lead_id", leadId)
    .eq("channel_type", "sms")
    .eq("status", "active")
    .single();
  if (conversationError || !conversation) fail("Privileged active SMS conversation lookup failed", conversationError);
  if (conversation.last_activity_at !== conversationActivityAt) fail("Active SMS conversation last_activity_at was not updated");
  conversationId = conversation.id;

  const recordedEvent = await requirePrivilegedRow("communication_events", communicationEventId, "id, conversation_id");
  if (recordedEvent.conversation_id !== conversationId) fail("Outbound SMS event was not associated with the active SMS conversation");

  await requirePrivilegedRow("leads", leadId);
  await requirePrivilegedRow("lead_activities", activity.id);
  await requirePrivilegedRow("lead_reminders", reminder.id);
  await requirePrivilegedRow("communication_events", communicationEventId);
  await requirePrivilegedRow("conversations", conversationId);
  console.log("Privileged CRM inserts and reads succeeded.");

  await requirePublicReadDenied("leads", leadId);
  await requirePublicReadDenied("lead_activities", activity.id);
  await requirePublicReadDenied("lead_reminders", reminder.id);
  await requirePublicReadDenied("communication_events", communicationEventId);
  await requirePublicReadDenied("conversations", conversationId);

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
    { lead_id: leadId, conversation_id: conversationId, event_type: "outbound_sms", direction: "outbound", body: publicActivityNote, created_source: "rls_access_check_public" },
    "body",
    publicActivityNote,
  );
  await requirePublicInsertDenied(
    "conversations",
    { lead_id: leadId, channel_type: "sms", status: "closed", last_activity_at: publicConversationActivity },
    "last_activity_at",
    publicConversationActivity,
  );

  await requirePublicMutationDenied("leads", leadId, { status: "lost" }, "status", "new");
  await requirePublicMutationDenied("lead_activities", activity.id, { note: "Blocked update" }, "note", "RLS verification fixture");
  await requirePublicMutationDenied("lead_reminders", reminder.id, { completed: true }, "completed", false);
  await requirePublicMutationDenied(
    "communication_events",
    communicationEventId,
    { body: "Blocked update" },
    "body",
    "RLS verification outbound SMS event",
  );
  await requirePublicMutationDenied("conversations", conversationId, { status: "closed" }, "status", "active");

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
