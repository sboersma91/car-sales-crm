# Car Sales CRM MVP

A staged build for a car-sales CRM, starting with repository controls and delivery guardrails before product feature development.

## Current Stage
Stage 0A — Repo Control Setup

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

## Local Setup (Placeholder)
1. Install dependencies: `npm install`
2. Copy environment template: `cp .env.example .env.local`
3. Fill in environment values
4. Start dev server: `npm run dev`

## Supabase Setup (Placeholder)
1. Create a Supabase project
2. Collect project URL and keys
3. Add values to `.env.local` using `.env.example`
4. Stage 0B will add a manual connection ping script

## Security Warning
Never commit secrets. Do not commit `.env.local` or any real API/service keys.
