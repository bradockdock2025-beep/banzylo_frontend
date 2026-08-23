// Shape of GET /homepage/hero. A 200 response with a `null` body is valid
// (hero disabled) — callers must treat HeroApi | null, never assume presence.
export interface HeroApi {
  id: string;
  desktopImage: string;
  mobileImage: string | null;
  eyebrow: string | null;
  title: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  isActive: boolean;
  updatedAt: string;
}
