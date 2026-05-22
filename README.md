# Car Sales CRM MVP

A staged build for a car-sales CRM, starting with repository controls and guarded technical slices before product feature development.

## Current Stage
Stage 1A — Server API Route for Lead Creation

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

## Stage 1A Setup: Server API Route for Lead Creation (Manual Only)
1. Ensure `.env.local` contains:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
2. Start the development server:
   ```bash
   npm run dev
   ```
3. In another terminal, test the API route:
   ```bash
   curl -i -X POST http://localhost:3000/api/leads \
     -H "Content-Type: application/json" \
     -d '{"name":"API Test Lead","phone":"555-555-5555","vehicle_interest":"Truck","source":"stage_1a_api_test","notes":"Created by API route test"}'
   ```

Expected successful response:
- HTTP status `201`
- Response body:
  ```json
  {
    "ok": true,
    "lead": {
      "id": "...",
      "created_at": "..."
    }
  }
  ```

> Important: This stage adds only a server-side API insert path and does **not** add frontend lead forms or dashboard workflows.

## Security Warning
Never commit secrets. Do not commit `.env.local` or any real API/service keys.
