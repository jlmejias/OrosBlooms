"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function NavigationFeedback() {
  const pathname = usePathname();
  return <NavigationFeedbackForPath key={pathname} />;
}

function NavigationFeedbackForPath() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target || link.hasAttribute("download")) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.hash || (destination.pathname === window.location.pathname && destination.search === window.location.search)) return;
      setLoading(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return <div className={`route-progress${loading ? " is-loading" : ""}`} role="status" aria-live="polite" aria-label="Cargando" />;
}
