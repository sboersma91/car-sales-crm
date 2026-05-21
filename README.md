# Car Sales CRM MVP

A staged build for a car-sales CRM, starting with repository controls and guarded technical slices before product feature development.

## Current Stage
Stage 0C — Leads Table SQL Scaffold

## What the MVP Will Eventually Do
The MVP v0.1 target is a basic lead-capture CRM where a lead can submit information, data is saved to Supabase, and leads appear in a simple dashboard.

## What Is Intentionally Not Built Yet
- Authentication
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

## Stage 0C Setup: Leads Table SQL (Manual Only)
1. Keep Stage 0B ping script available for connectivity checks:
   ```bash
   npm run db:ping
   ```
2. Review the SQL scaffold file:
   - `supabase/sql/001_create_leads.sql`
3. Apply SQL manually in your Supabase SQL workflow (SQL editor or migration tooling).

> Important: This stage does **not** add frontend features and does **not** auto-apply SQL.

## Security Warning
Never commit secrets. Do not commit `.env.local` or any real API/service keys.
