import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { pageViews } from "@/db/schema";
import { visitorLocationFromHeaders } from "@/lib/visitor-location";

const visitorCookie = "oros_visitor";
const cookieLifetime = 60 * 60 * 24 * 30;
const excludedPaths = ["/carrito", "/checkout", "/favoritos", "/pedido/", "/design-system"];
const payloadSchema = z.object({
  path: z.string().max(240).regex(/^\/[a-z0-9/_-]*$/i),
});

function shouldTrack(path: string) {
  return !excludedPaths.some(excluded => path === excluded || path.startsWith(excluded));
}

export async function POST(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !shouldTrack(parsed.data.path)) return NextResponse.json({ error: "Visita no válida." }, { status: 400 });

  const currentVisitor = request.cookies.get(visitorCookie)?.value;
  const hasValidVisitor = Boolean(currentVisitor && /^[a-f0-9-]{36}$/i.test(currentVisitor));
  const visitor = hasValidVisitor ? currentVisitor! : randomUUID();
  const visitorHash = createHash("sha256").update(visitor).digest("hex");
  const location = visitorLocationFromHeaders(request.headers);

  await db.insert(pageViews).values({ visitorHash, path: parsed.data.path, ...location });

  const response = new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  if (!hasValidVisitor) response.cookies.set(visitorCookie, visitor, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: cookieLifetime });
  return response;
}
