# Car Sales CRM MVP

A staged build for a car-sales CRM, starting with repository controls and guarded technical slices before product feature development.

## Current Stage
Stage 0B — Supabase Connection Ping

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

## Stage 0B Setup: Supabase Ping
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```
3. Set these values in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` (reserved for later stages; not used by ping script)
4. Run the connectivity check:
   ```bash
   npm run db:ping
   ```
5. Expected behavior:
   - Success prints `Supabase ping succeeded.` and the number of rows returned from `health_check`.

## Security Warning
Never commit secrets. Do not commit `.env.local` or any real API/service keys.
