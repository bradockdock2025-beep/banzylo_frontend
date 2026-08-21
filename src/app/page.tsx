import Hero from "@/components/home/Hero";
import BrandLogoStrip from "@/components/home/BrandLogoStrip";
import NewArrivals from "@/components/home/NewArrivals";
import CategoryBanners from "@/components/home/CategoryBanners";
import BrandSection from "@/components/home/BrandSection";
import AboutSection from "@/components/home/AboutSection";
import { getNewArrivals, getBrandSection, getAboutSection } from "@/lib/home-featured";

export default function Home() {
  const newArrivals = getNewArrivals();
  const about = getAboutSection();

  return (
    <div>
      <Hero />
      <BrandLogoStrip />
      <NewArrivals
        productsByCategory={{
          apparel: newArrivals.apparel.slice(0, 6),
          sneakers: newArrivals.sneakers.slice(0, 6),
          accessories: newArrivals.accessories.slice(0, 6),
        }}
      />
      <CategoryBanners />
      <BrandSection
        heading="Chrome Hearts"
        viewAllHref="/collections/chrome-hearts"
        products={getBrandSection("chromeHearts").products.slice(0, 6)}
      />
      <BrandSection
        heading="Satoshi Nakamoto"
        viewAllHref="/collections/satoshi-nakamoto"
        products={getBrandSection("satoshiNakamoto").products.slice(0, 6)}
      />
      <BrandSection
        heading="Paly Hollywood"
        viewAllHref="/collections/paly-hollywood"
        products={getBrandSection("palyHollywood").products.slice(0, 6)}
      />
      <BrandSection
        heading="Vale Forever"
        viewAllHref="/collections/vale-forever"
        products={getBrandSection("valeForever").products.slice(0, 6)}
      />
      <BrandSection
        heading="Enfants Riches Déprimés"
        viewAllHref="/collections/enfants-riches-deprimes"
        products={getBrandSection("enfantsRichesDeprimes").products.slice(0, 6)}
      />
      <BrandSection
        heading="Bottega Desires"
        viewAllHref="/collections/bottega-desires"
        products={getBrandSection("bottegaDesires").products.slice(0, 6)}
      />
      <AboutSection about={about} />
    </div>
  );
}
