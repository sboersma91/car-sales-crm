-- Stage 3: add lead workflow update timestamp.
-- Run manually in Supabase SQL editor/migrations workflow.

alter table public.leads
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_leads_updated_at_on_status_change()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at_on_status_change on public.leads;

create trigger leads_set_updated_at_on_status_change
before update of status on public.leads
for each row
when (old.status is distinct from new.status)
execute function public.set_leads_updated_at_on_status_change();
