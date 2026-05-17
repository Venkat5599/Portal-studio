export const siteConfig = {
  name: "PalletMan",
  tagline: "Postman for Portaldot",
  description:
    "Explore every pallet, test any extrinsic, and submit transactions on Portaldot — all from your browser. No code required.",
  url: "https://palletman.xyz",
  twitter: "@palletman",
} as const;

export const features = {
  smoothScroll: true,
  parallaxHero: true,
  blurInHeadline: true,
} as const;

export const themeConfig = {
  defaultTheme: "system" as "light" | "dark" | "system",
  enableSystemTheme: true,
} as const;
