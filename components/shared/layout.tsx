import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12", className)} {...props} />;
}

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-14 sm:py-20 lg:py-28", className)} {...props} />;
}

export function SectionHeader({ eyebrow, title, description, action, className }: { eyebrow?: string; title: string; description?: string; action?: ReactNode; className?: string }) {
  return <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10", className)}>
    <div className="max-w-2xl">
      {eyebrow && <p className="type-caption mb-3 text-olive">{eyebrow}</p>}
      <h2 className="type-h2">{title}</h2>
      {description && <p className="type-body-lg mt-3 text-muted">{description}</p>}
    </div>
    {action}
  </div>;
}
