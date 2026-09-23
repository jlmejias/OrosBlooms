import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";

export type BrandingSettings = {
  brandName: string;
  logoUrl: string;
  logoAltEs: string;
  logoAltEn: string;
  faviconUrl: string;
  heroVideoUrl: string;
  heroImageUrl: string;
  heroImageAltEs: string;
  heroImageAltEn: string;
  backgroundColor: string;
  foregroundColor: string;
  primaryColor: string;
  accentColor: string;
  softAccentColor: string;
};

export const defaultBrandingSettings: BrandingSettings = {
  brandName: "OrosBlooms",
  logoUrl: "/orosblooms-logo.png",
  logoAltEs: "OrosBlooms",
  logoAltEn: "OrosBlooms",
  faviconUrl: "/icon.svg",
  heroVideoUrl: "/videos/hero-orosblooms.mp4",
  heroImageUrl: "/home-hero.webp",
  heroImageAltEs: "Diseño floral artesanal de OrosBlooms",
  heroImageAltEn: "Handcrafted floral design by OrosBlooms",
  backgroundColor: "#faf8f4",
  foregroundColor: "#292b25",
  primaryColor: "#59654d",
  accentColor: "#744448",
  softAccentColor: "#f8ebec",
};

export const getBrandingSettings = cache(async (): Promise<BrandingSettings> => {
  const [row] = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "branding")).limit(1);
  return { ...defaultBrandingSettings, ...(row?.value as Partial<BrandingSettings> | undefined) };
});

