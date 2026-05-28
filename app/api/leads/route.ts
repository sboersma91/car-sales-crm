import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type LeadPayload = {
  first_name?: unknown;
  last_name?: unknown;
  phone?: unknown;
  email?: unknown;
  vehicle_interest?: unknown;
  source?: unknown;
  notes?: unknown;
};

const MAX_LENGTH = {
  first_name: 100,
  last_name: 100,
  phone: 30,
  email: 255,
  vehicle_interest: 120,
  source: 80,
  notes: 2000,
} as const;

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

  const firstName = normalizeOptionalString(body.first_name);
  if (!firstName) {
    return NextResponse.json({ error: "First name is required" }, { status: 400 });
  }

  const lastName = normalizeOptionalString(body.last_name);

  const phone = normalizeOptionalString(body.phone);
  const email = normalizeOptionalString(body.email);
  const vehicleInterest = normalizeOptionalString(body.vehicle_interest);
  const source = normalizeOptionalString(body.source) ?? "website";
  const notes = normalizeOptionalString(body.notes);

  const fieldsToValidate = {
    first_name: firstName,
    last_name: lastName,
    phone,
    email,
    vehicle_interest: vehicleInterest,
    source,
    notes,
  } as const;

  for (const [field, value] of Object.entries(fieldsToValidate)) {
    if (value && value.length > MAX_LENGTH[field as keyof typeof MAX_LENGTH]) {
      return NextResponse.json(
        { error: `${field} exceeds max length of ${MAX_LENGTH[field as keyof typeof MAX_LENGTH]}` },
        { status: 400 },
      );
    }
  }

  if (!phone && !email) {
    return NextResponse.json({ error: "Phone or email is required" }, { status: 400 });
  }

  if (email) {
    const hasAt = email.includes("@");
    const hasDot = email.includes(".");
    const noSpaces = !/\s/.test(email);
    const noEdgeAt = !email.startsWith("@") && !email.endsWith("@");
    if (!hasAt || !hasDot || !noSpaces || !noEdgeAt) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
  }

  if (phone) {
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 7) {
      return NextResponse.json({ error: "Invalid phone format" }, { status: 400 });
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    console.error("Lead creation route missing required server env vars.");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, secretKey);

  const fiveMinutesAgoIso = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const duplicateMatchers: string[] = [];
  if (phone) duplicateMatchers.push(`phone.eq.${phone}`);
  if (email) duplicateMatchers.push(`email.eq.${email}`);

  const { data: duplicateRows, error: duplicateLookupError } = await supabase
    .from("leads")
    .select("id")
    .eq("first_name", firstName)
    .or(duplicateMatchers.join(","))
    .gte("created_at", fiveMinutesAgoIso)
    .limit(1);

  if (duplicateLookupError) {
    console.error("Duplicate lookup failed:", duplicateLookupError.message);
  }

  if (duplicateRows && duplicateRows.length > 0) {
    return NextResponse.json(
      {
        ok: true,
        duplicate: true,
        message: "We already received this lead recently.",
      },
      { status: 200 },
    );
  }

  const payload = {
    first_name: firstName,
    last_name: lastName,
    phone,
    email,
    vehicle_interest: vehicleInterest,
    source,
    notes,
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
