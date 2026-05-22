# CRM Project Control Doc

## Current Stage
Stage 0D — Leads Protection Check

## Current Objective
Add a manual script that verifies `public.leads` is not publicly readable/writable through the publishable key.

## Next Technical Objective
Stage 0E — Controlled Lead Insert Validation

Validate a controlled insert/read flow with proper policies and no UI feature rollout.

## Good to Ship Now
- GitHub repo exists
- PROJECT_CONTROL.md exists
- README.md explains the project
- .env.example documents required environment variables
- .gitignore prevents secrets and local files from being committed
- Manual Supabase ping script exists
- Stage 0C SQL file exists for `leads` table scaffold
- Stage 0D protection-check script exists
- No CRM frontend features have been added

## Not Allowed Yet
- Auth
- AI follow-up
- Auto texting
- Auto email
- Payment quoting
- Inventory lookup
- Multi-user accounts
- Fancy dashboard
- Lead scoring
- Complex automations
- Customer-facing production use

## MVP v0.1 Target
A basic lead capture CRM where a lead can submit information, the data saves to Supabase, and the lead appears in a simple dashboard.

Minimum lead fields:
- name
- phone
- email
- vehicle_interest
- notes
- source
- status
- created_at

## Build Principle
One thin slice at a time. Working beats fancy.

## Current Codex Task
Set up Stage 0D protection verification script and docs only. Do not build frontend features and do not change schema.

## Definition of Done
The repo includes a runnable Stage 0D protection check script, updated documentation, and no CRM UI/features beyond setup scaffolding.
