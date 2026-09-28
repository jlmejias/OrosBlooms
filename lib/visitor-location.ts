type VisitorLocation = { city: string | null; region: string | null; country: string | null };

function clean(value: string | null | undefined, maxLength = 120) {
  if (!value) return null;
  try {
    const decoded = decodeURIComponent(value).replace(/[\u0000-\u001f\u007f]/g, "").trim();
    return decoded ? decoded.slice(0, maxLength) : null;
  } catch {
    return null;
  }
}

function vercelLocation(headers: Headers): VisitorLocation | null {
  if (!headers.get("x-vercel-id")) return null;
  return {
    city: clean(headers.get("x-vercel-ip-city")),
    region: clean(headers.get("x-vercel-ip-country-region")),
    country: clean(headers.get("x-vercel-ip-country"), 2)?.toUpperCase() ?? null,
  };
}

function cloudflareLocation(headers: Headers): VisitorLocation | null {
  if (!headers.get("cf-ray")) return null;
  return {
    city: clean(headers.get("cf-ipcity")),
    region: clean(headers.get("cf-region")),
    country: clean(headers.get("cf-ipcountry"), 2)?.toUpperCase() ?? null,
  };
}

function netlifyLocation(headers: Headers): VisitorLocation | null {
  if (!headers.get("x-nf-request-id")) return null;
  try {
    const geo = JSON.parse(headers.get("x-nf-geo") ?? "{}") as { city?: string; subdivision?: string; country?: { code?: string } };
    return { city: clean(geo.city), region: clean(geo.subdivision), country: clean(geo.country?.code, 2)?.toUpperCase() ?? null };
  } catch {
    return null;
  }
}

export function visitorLocationFromHeaders(headers: Headers): VisitorLocation {
  return vercelLocation(headers) ?? cloudflareLocation(headers) ?? netlifyLocation(headers) ?? { city: null, region: null, country: null };
}
