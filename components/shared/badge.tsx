import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "floral" | "sage";
const tones: Record<Tone, string> = {
  neutral: "bg-cream text-foreground",
  floral: "bg-blush-soft text-burgundy",
  sage: "bg-sage-soft text-olive",
};

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", tones[tone], className)} {...props} />;
}

export function Chip({ selected = false, className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return <button type={type} aria-pressed={selected} className={cn("inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-4 text-sm transition-colors", selected ? "border-burgundy bg-blush-soft text-burgundy" : "border-border bg-surface text-foreground hover:bg-cream", className)} {...props} />;
}
