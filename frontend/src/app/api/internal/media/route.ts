import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL, AUTH_COOKIE } from "@/lib/api";

/**
 * Thin proxy: forwards GET (list) and POST (upload) requests to Laravel's
 * /api/media endpoint with the auth cookie attached as a Bearer token.
 *
 * Why: the auth cookie is httpOnly so the browser can't read it. Routing
 * client uploads through this handler lets us keep the token secret while
 * still doing direct multipart FormData uploads (no server-action body
 * size limits, no progress event loss).
 */

async function bearer(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE)?.value ?? null;
}

export async function GET(req: Request) {
  const token = await bearer();
  if (!token) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const target = `${API_URL}/api/media${url.search}`;

  const res = await fetch(target, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  const token = await bearer();
  if (!token) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  // Re-stream the incoming multipart body to Laravel. We can't read it as
  // JSON (file binary), so we forward the raw body + content-type.
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) {
    return NextResponse.json(
      { message: "Expected multipart/form-data." },
      { status: 415 }
    );
  }

  // Buffer the FormData and reconstruct — Laravel's CSRF/multipart parser
  // expects a clean boundary, which `fetch` will regenerate for us.
  const form = await req.formData();

  const res = await fetch(`${API_URL}/api/media`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
