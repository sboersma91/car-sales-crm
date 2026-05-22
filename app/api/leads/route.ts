import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type LeadPayload = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  vehicle_interest?: unknown;
  source?: unknown;
  notes?: unknown;
};

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  let body: LeadPayload;

  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = normalizeOptionalString(body.name);
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const phone = normalizeOptionalString(body.phone);
  const email = normalizeOptionalString(body.email);

  if (!phone && !email) {
    return NextResponse.json({ error: "Phone or email is required" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    console.error("Lead creation route missing required server env vars.");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, secretKey);

  const payload = {
    name,
    phone,
    email,
    vehicle_interest: normalizeOptionalString(body.vehicle_interest),
    source: normalizeOptionalString(body.source) ?? "website",
    notes: normalizeOptionalString(body.notes),
    status: "new",
  };

  const { data, error } = await supabase
    .from("leads")
    .insert(payload)
    .select("id, created_at")
    .single();

  if (error || !data) {
    console.error("Lead creation failed:", error?.message ?? "Unknown insert error");
    return NextResponse.json({ error: "Lead creation failed" }, { status: 500 });
  }

  return NextResponse.json(
    {
      ok: true,
      lead: {
        id: data.id,
        created_at: data.created_at,
      },
    },
    { status: 201 },
  );
}
