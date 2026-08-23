// Shape of GET /products/new-arrivals?categoryId=<...>.
// Confirmed gap (2026-08-23): the API includes `brandId` but never expands
// `brand` here — see src/lib/api/new-arrivals.ts for how the UI handles it.

export interface NewArrivalImageApi {
  url: string;
  altText: string | null;
  position: number;
}

export interface NewArrivalVariantApi {
  id: string;
  price: string;
  isActive: boolean;
  isAvailable: boolean;
}

export interface NewArrivalApi {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  createdAt: string;
  variants: NewArrivalVariantApi[];
  images: NewArrivalImageApi[];
}

export interface NewArrivalsResponseApi {
  data: NewArrivalApi[];
  meta: {
    total: number;
    /** false when data.length < 4 — the section should hide entirely, not just render fewer cards. */
    visible: boolean;
    section: string;
    windowDays: number;
  };
}
