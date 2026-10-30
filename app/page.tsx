import { DetailsSection } from "@/components/home/details-section";
import { HeroSection } from "@/components/home/hero-section";
import { getSiteVariant } from "@/lib/get-site-variant";

export default async function Home() {
  const siteVariant = await getSiteVariant();

  return (
    <>
      <HeroSection />
      <DetailsSection siteVariant={siteVariant} />
    </>
  );
}
