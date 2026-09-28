import { getE2ePublicBlob } from "@/lib/blob";

export async function GET(request: Request, context: RouteContext<"/api/e2e-media/[...pathname]">) {
  if (process.env.LOCAL_STORAGE_FOR_QA !== "true") return new Response(null, { status: 404 });
  const { pathname } = await context.params;
  const file = await getE2ePublicBlob(pathname.join("/"), request.headers.get("if-none-match") ?? undefined);
  if (!file) return new Response(null, { status: 404 });
  const headers = new Headers({ "Cache-Control": "no-store", "Content-Type": file.contentType, "X-Content-Type-Options": "nosniff" });
  if (file.etag) headers.set("ETag", file.etag);
  return file.notModified ? new Response(null, { status: 304, headers }) : new Response(file.bytes as BodyInit, { headers });
}
