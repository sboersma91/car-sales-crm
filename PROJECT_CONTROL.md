# CRM Project Control Doc

## Current Stage
Stage 0B — Supabase Connection Ping

## Current Objective
Create a manual script that proves the app can connect to Supabase using safe client-side environment variables.

## Next Technical Objective
Stage 0C — Minimal Lead Capture Slice (Scaffold Only)

Define the smallest schema and route plan for a single lead write/read path without adding automations.

## Good to Ship Now
- GitHub repo exists
- PROJECT_CONTROL.md exists
- README.md explains the project
- .env.example documents required environment variables
- .gitignore prevents secrets and local files from being committed
- Manual Supabase ping script exists
- No CRM feature workflows have been added yet

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
Set up Stage 0B connectivity proof only (manual Supabase ping).

## Definition of Done
The repo includes a runnable manual ping script for Supabase connectivity, updated documentation, and no CRM features beyond setup scaffolding.
