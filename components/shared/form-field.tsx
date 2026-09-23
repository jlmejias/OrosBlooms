import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const control = "min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/70 focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20";

export function TextField({ label, id, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return <label className="block text-sm font-medium" htmlFor={id}>{label}<input id={id} className={cn("mt-2", control, className)} {...props} /></label>;
}

export function TextAreaField({ label, id, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; id: string }) {
  return <label className="block text-sm font-medium" htmlFor={id}>{label}<textarea id={id} className={cn("mt-2 min-h-28", control, className)} {...props} /></label>;
}
