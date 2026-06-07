-- Outbound SMS Foundation: allow successful Twilio sends in the canonical timeline.
-- Run manually after 007 in the Supabase SQL editor/migrations workflow.

alter table public.communication_events
  drop constraint if exists communication_events_event_type_check;

alter table public.communication_events
  add constraint communication_events_event_type_check
  check (event_type in ('manual_note', 'status_change', 'reminder_created', 'outbound_sms'));
