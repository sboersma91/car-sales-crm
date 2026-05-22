# CRM Project Control Doc

## Current Stage
Stage 1A — Server API Route for Lead Creation

## Current Objective
Add a server-side `POST /api/leads` route that validates input and inserts into `public.leads` using `SUPABASE_SECRET_KEY`.

## Next Technical Objective
Stage 1B — Minimal API Hardening and Error Cases

Add targeted validation/error-path tests and tighten operational logging boundaries.

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
- Stage 1A API route exists for server-side lead creation

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
Set up Stage 1A server-only lead creation API route. Do not add frontend lead forms, dashboards, or schema changes.

## Definition of Done
The repo includes a runnable `POST /api/leads` server route with validation and safe insert behavior, plus updated documentation.
