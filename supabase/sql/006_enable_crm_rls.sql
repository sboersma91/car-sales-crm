-- Phase 5: deny direct publishable-key access to CRM tables by default.
-- Run manually after 001-005 in the Supabase SQL editor/migrations workflow.
-- CRM access remains server-side only, so no anon or authenticated policies are retained.

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('leads', 'lead_activities', 'lead_reminders')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end
$$;

alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.lead_reminders enable row level security;
