"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const excludedPaths = ["/carrito", "/checkout", "/favoritos", "/pedido/", "/design-system"];

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || excludedPaths.some(path => pathname === path || pathname.startsWith(path))) return;

    void fetch("/api/analytics/pageview", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
