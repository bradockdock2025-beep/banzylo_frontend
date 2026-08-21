export interface HomeFeaturedProduct {
  slug: string;
  title: string;
  price: number | null;
  images: string[];
}

export interface HomeFeaturedBrand {
  label: string;
  products: HomeFeaturedProduct[];
}

export interface HomeFeaturedData {
  newArrivals: {
    apparel: HomeFeaturedProduct[];
    sneakers: HomeFeaturedProduct[];
    accessories: HomeFeaturedProduct[];
  };
  brands: Record<string, HomeFeaturedBrand>;
  about: {
    heading: string | null;
    paragraph: string | null;
    buttonLabel: string | null;
    buttonHref: string | null;
    image?: string;
  };
}
