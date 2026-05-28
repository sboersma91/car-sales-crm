-- Stage 1B.1: migrate from legacy `name` column to `first_name`/`last_name`.
-- Run manually in Supabase SQL editor/migrations workflow.

alter table public.leads
  add column if not exists first_name text,
  add column if not exists last_name text;

update public.leads
set
  first_name = nullif(btrim(name), ''),
  last_name = null
where first_name is null;

update public.leads
set first_name = 'Unknown'
where first_name is null or btrim(first_name) = '';

alter table public.leads
  alter column first_name set not null;

alter table public.leads
  drop column if exists name;
