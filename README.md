# Car Sales CRM MVP

A staged build for a car-sales CRM, starting with repository controls and guarded technical slices before product feature development.

## Current Stage
Stage 1B — Minimal Lead Capture Form

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

## Stage 1B Setup: Minimal Lead Capture Form (Manual Only)
1. Ensure `.env.local` contains:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the app in your browser:
   - `http://localhost:3000`
4. Fill and submit the lead capture form:
   - `first_name` is required
   - `last_name` is optional
   - at least one of `phone` or `email` is required
   - optional: `vehicle_interest`, `notes`
5. The form submits to `POST /api/leads` with `source` set to `website_form`.
6. Success criteria:
   - You see a success message on the page
   - Form fields reset
   - New lead appears in Supabase `public.leads`

To manually test the API route directly (optional):
   ```bash
   curl -i -X POST http://localhost:3000/api/leads \
     -H "Content-Type: application/json" \
     -d '{"first_name":"API","last_name":"Test Lead","phone":"555-555-5555","vehicle_interest":"Truck","source":"stage_1a_api_test","notes":"Created by API route test"}'
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

> Important: This stage adds only a minimal lead capture form that submits to the existing server API route. It does **not** add dashboard workflows, auth, or automations.

## Security Warning
Never commit secrets. Do not commit `.env.local` or any real API/service keys.
