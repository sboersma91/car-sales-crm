# Car Sales CRM MVP

A staged build for a car-sales CRM, starting with repository controls and guarded technical slices before product feature development.

## Current Stage
Stage 0E — Server-side Lead Insert Test

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

## Stage 0E Setup: Server-side Lead Insert Test (Manual Only)
1. Ensure `.env.local` contains:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
2. Run the server-side insert test:
   ```bash
   npm run db:server-insert-test
   ```
3. The script inserts a fake server-side lead and then deletes it as cleanup.

Expected success output:
- `Server-side lead insert succeeded.`
- `Server-side lead cleanup succeeded.`
- `Stage 0E server insert test passed.`

> Important: This stage does **not** add frontend features and does **not** apply or alter schema automatically.

## Security Warning
Never commit secrets. Do not commit `.env.local` or any real API/service keys.
