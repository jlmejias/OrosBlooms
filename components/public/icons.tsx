type IconName = "menu" | "close" | "search" | "bag" | "heart" | "user" | "home" | "flower" | "sparkle" | "arrow" | "instagram" | "facebook";

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className, "aria-hidden": true as const };
  const paths: Record<IconName, React.ReactNode> = {
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="M5 5l14 14M19 5 5 19" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.5 4.5" /></>,
    bag: <><path d="M4.5 8h15l-1 12h-13l-1-12Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    heart: <><path d="M20.5 5.5a5.3 5.3 0 0 0-7.5 0L12 6.6l-1-1.1a5.3 5.3 0 0 0-7.5 7.5L12 21l8.5-8a5.3 5.3 0 0 0 0-7.5Z" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
    home: <><path d="m3 10 9-7 9 7v10H3V10Z" /><path d="M9 20v-6h6v6" /></>,
    flower: <><circle cx="12" cy="12" r="2" /><path d="M12 10c-3-3-2-7 0-7s3 4 0 7Zm2 2c3-3 7-2 7 0s-4 3-7 0Zm-2 2c3 3 2 7 0 7s-3-4 0-7Zm-2-2c-3 3-7 2-7 0s4-3 7 0Z" /></>,
    sparkle: <><path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Z" /></>,
    arrow: <><path d="M4 12h16m-6-6 6 6-6 6" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".5" fill="currentColor" /></>,
    facebook: <><path d="M14 21v-8h3l.5-3H14V8.5c0-.9.3-1.5 1.7-1.5H18V4.3c-.6-.1-1.5-.3-2.6-.3C12.7 4 11 5.6 11 8.6V10H8v3h3v8" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}
