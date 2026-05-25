import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL, AUTH_COOKIE } from "@/lib/api";

/**
 * Single-item media proxy: GET / PATCH / DELETE → Laravel /api/media/{id}.
 */

async function bearer(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE)?.value ?? null;
}

async function forward(
  method: "GET" | "PATCH" | "DELETE",
  id: string,
  rawBody?: string
): Promise<NextResponse> {
  const token = await bearer();
  if (!token) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/api/media/${id}`, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(rawBody ? { "Content-Type": "application/json" } : {}),
    },
    body: rawBody,
    cache: "no-store",
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return forward("GET", id);
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.text();
  return forward("PATCH", id, body);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return forward("DELETE", id);
}
