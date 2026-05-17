/**
 * ============================================================================
 * SITE CONFIGURATION
 * ============================================================================
 *
 * Central copy for the Mantle Firewall landing page.
 */

export const siteConfig = {
  name: "Mantle Firewall",
  tagline: "Trade with Proof",
  description:
    "AI-powered transaction screening, contract intelligence, and risk attestations for Mantle.",

  url: "https://mantlefirewall.xyz",
  twitter: "@mantlefirewall",

  nav: {
    cta: {
      text: "Launch demo",
      href: "#",
    },
    signIn: {
      text: "Docs",
      href: "#",
    },
  },
};

export const heroConfig = {
  badge: "Turing Test Hackathon 2026",
  headline: {
    line1: "Mantle Firewall",
    line2: "Trade with",
    accent: "Proof",
  },
  subheadline:
    "AI-powered security checks for agents, wallets, and Mantle transactions.",
  cta: {
    text: "Run risk scan",
    href: "#",
  },
};

export const blurHeadlineConfig = {
  text: "Mantle Firewall turns AI security into verifiable on-chain infrastructure for autonomous agents and everyday users.",
};

export const testimonialsConfig = {
  title: "Built around the judging criteria",
  autoplayInterval: 10000,
};

export const howItWorksConfig = {
  title: "How it works",
  description:
    "AI evaluates the action, the product guides the user, and Mantle stores the proof.",
  cta: {
    text: "View architecture",
    href: "#",
  },
};

export const pricingConfig = {
  title: "Prize strategy",
  description:
    "Deployment, Mantle utility, technical depth, and product completeness.",
  billingNote: "Hackathon alignment",
};

export const faqConfig = {
  title: "Everything judges need to see",
  description:
    "Clear answers for the product story, technical scope, and hackathon submission.",
  cta: {
    primary: {
      text: "Launch demo",
      href: "#",
    },
    secondary: {
      text: "Read docs",
      href: "#",
    },
  },
};

export const footerConfig = {
  cta: {
    headline: "Protect the next agent before it signs",
    placeholder: "Enter wallet or email",
    button: "Request demo",
  },
  copyright: `© ${new Date().getFullYear()} Mantle Firewall. Built for the Turing Test Hackathon.`,
};

export const features = {
  smoothScroll: true,
  testimonialAutoplay: true,
  parallaxHero: true,
  blurInHeadline: true,
};

export const themeConfig = {
  defaultTheme: "system" as "light" | "dark" | "system",
  enableSystemTheme: true,
};
