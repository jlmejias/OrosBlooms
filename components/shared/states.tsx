import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, action, className }: { title: string; description: string; action?: ReactNode; className?: string }) {
  return <div className={cn("rounded-[var(--radius-card)] border border-border bg-surface px-6 py-12 text-center", className)}>
    <div aria-hidden="true" className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blush-soft font-serif text-3xl text-burgundy">✽</div>
    <h3 className="type-h3">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm text-muted">{description}</p>{action && <div className="mt-6">{action}</div>}
  </div>;
}

export function LoadingState({ label = "Cargando", className }: { label?: string; className?: string }) {
  return <div className={cn("rounded-[var(--radius-card)] border border-border bg-surface p-4", className)} role="status" aria-label={label}>
    <div className="aspect-[4/3] animate-pulse rounded-xl bg-cream" /><div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-cream" /><div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-cream" /><span className="sr-only">{label}</span>
  </div>;
}
