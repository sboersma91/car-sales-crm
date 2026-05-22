# CRM Project Control Doc

## Current Stage
Stage 0E — Server-side Lead Insert Test

## Current Objective
Add a manual server-side script that verifies an intentional lead insert works with `SUPABASE_SECRET_KEY`, then cleans up the test row.

## Next Technical Objective
Stage 0F — Minimal API Path Planning

Define the thinnest safe server-only insertion path before any UI rollout.

## Good to Ship Now
- GitHub repo exists
- PROJECT_CONTROL.md exists
- README.md explains the project
- .env.example documents required environment variables
- .gitignore prevents secrets and local files from being committed
- Manual Supabase ping script exists
- Stage 0C SQL file exists for `leads` table scaffold
- Stage 0D protection-check script exists
- Stage 0E server-insert test script exists
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
Set up Stage 0E manual server-side insert verification and cleanup script only. Do not build frontend features and do not change schema.

## Definition of Done
The repo includes a runnable Stage 0E server-side insert/cleanup test script, updated documentation, and no CRM UI/features beyond setup scaffolding.
