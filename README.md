# Car Sales CRM MVP

A staged build for a car-sales CRM, starting with repository controls and guarded technical slices before product feature development.

## Current Stage
Stage 0D — Leads Protection Check

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

## Stage 0D Setup: Leads Protection Check (Manual Only)
1. Keep Stage 0B connectivity ping available:
   ```bash
   npm run db:ping
   ```
2. Ensure `.env.local` contains:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Run the protection check:
   ```bash
   npm run db:leads-protection-check
   ```

Expected success output:
- `Leads public insert blocked as expected.`

If you see a serious warning about insert succeeding, your `leads` table is writable via the publishable key and must be fixed immediately with RLS/policies.

> Important: This stage does **not** add frontend features and does **not** apply or alter schema automatically.

## Security Warning
Never commit secrets. Do not commit `.env.local` or any real API/service keys.
