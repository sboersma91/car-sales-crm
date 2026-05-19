# CRM Project Control Doc

## Current Stage
Stage 0A — Repo Control Setup

## Current Objective
Set up the repository with clear project rules, environment documentation, and build guardrails before adding CRM features.

## Next Technical Objective
Stage 0B — Supabase Connection Ping

Create a manual script that proves the app can connect to Supabase.

## Good to Ship Now
- GitHub repo exists
- PROJECT_CONTROL.md exists
- README.md explains the project
- .env.example documents required environment variables
- .gitignore prevents secrets and local files from being committed
- No product features have been added yet

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
Set up repo control files only.

## Definition of Done
The repo has basic documentation and guardrails, and no CRM features have been built yet.
