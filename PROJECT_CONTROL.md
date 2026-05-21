# CRM Project Control Doc

## Current Stage
Stage 0C — Leads Table SQL Scaffold

## Current Objective
Add the initial SQL scaffold for the `leads` table as a manual migration file only.

## Next Technical Objective
Stage 0D — Manual Insert/Read Validation

Validate that inserts and reads work against the `leads` table using manual scripts only.

## Good to Ship Now
- GitHub repo exists
- PROJECT_CONTROL.md exists
- README.md explains the project
- .env.example documents required environment variables
- .gitignore prevents secrets and local files from being committed
- Manual Supabase ping script exists
- Stage 0C SQL file exists for `leads` table scaffold
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
Set up Stage 0C SQL scaffold only. Do not build frontend features and do not auto-apply SQL.

## Definition of Done
The repo includes a Stage 0C SQL migration file for `leads`, updated documentation, and no CRM UI/features beyond setup scaffolding.
