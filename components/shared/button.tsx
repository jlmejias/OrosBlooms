import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "default" | "compact";

const variants: Record<Variant, string> = {
  primary: "bg-olive text-white hover:bg-olive-hover",
  secondary: "bg-blush-soft text-foreground hover:bg-blush-hover",
  outline: "border border-border bg-surface text-foreground hover:bg-cream",
  ghost: "bg-transparent text-foreground hover:bg-cream",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ className, variant = "primary", size = "default", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50", size === "compact" && "min-h-10 px-4", variants[variant], className)} {...props} />;
}

export function IconButton({ label, icon, className, variant = "outline", ...props }: Omit<ButtonProps, "children"> & { label: string; icon: ReactNode }) {
  return <Button aria-label={label} title={label} variant={variant} className={cn("h-11 w-11 shrink-0 rounded-full p-0", className)} {...props}>{icon}</Button>;
}
