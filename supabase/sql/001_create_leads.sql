-- Stage 0C: leads table scaffold only.
-- Do not auto-apply in app startup; run manually in Supabase SQL editor/migrations workflow.
-- This table is intentionally protected with RLS and no public read/write policies yet.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  vehicle_interest text,
  source text not null default 'unknown',
  status text not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint leads_status_check check (
    status in (
      'new',
      'contacted',
      'appointment_set',
      'working',
      'closed_won',
      'closed_lost',
      'bad_fit'
    )
  )
);

alter table public.leads enable row level security;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_leads_updated_at on public.leads;

create trigger set_leads_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

comment on table public.leads is 'Stage 0C scaffold table for CRM leads. RLS enabled with no public policies yet.';