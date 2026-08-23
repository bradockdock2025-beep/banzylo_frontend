import Hero from "@/components/home/Hero";
import BrandLogoStrip from "@/components/home/BrandLogoStrip";
import NewArrivals from "@/components/home/NewArrivals";
import CategoryBanners from "@/components/home/CategoryBanners";
import BrandSection from "@/components/home/BrandSection";
import AboutSection from "@/components/home/AboutSection";
import { getHero, getTiles } from "@/lib/api/homepage";
import { getNewArrivals } from "@/lib/api/new-arrivals";
import { getBrandCarousels } from "@/lib/api/brand-carousels";
import { CURATED_BRAND_SECTIONS } from "@/data/curated-brands";
// "About" has no backend endpoint (guide §12) — still served from the
// original real-content JSON, unlike every other section on this page.
import { getAboutSection } from "@/lib/home-featured";

export default async function Home() {
  const [hero, tiles, newArrivals, brandCarousels] = await Promise.all([
    getHero(),
    getTiles("categorias-destaque"),
    getNewArrivals(),
    getBrandCarousels(CURATED_BRAND_SECTIONS.map((section) => section.slug)),
  ]);

  const about = getAboutSection();

  return (
    <div>
      <Hero hero={hero} />
      <BrandLogoStrip />
      <NewArrivals
        tabs={[
          { key: "apparel", label: "Apparel", ...newArrivals.apparel },
          { key: "sneakers", label: "Sneakers", ...newArrivals.sneakers },
          { key: "accessories", label: "Accessories", ...newArrivals.accessories },
        ]}
      />
      <CategoryBanners tiles={tiles} />
      {CURATED_BRAND_SECTIONS.map((section) => (
        <BrandSection
          key={section.slug}
          heading={section.heading}
          viewAllHref={`/collections/${section.slug}`}
          products={brandCarousels[section.slug] ?? []}
        />
      ))}
      <AboutSection about={about} />
    </div>
  );
}
