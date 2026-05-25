

import { HeroSection }     from '@/widgets/HeroSection/HeroSection';
import { FeaturedSection } from '@/widgets/FeaturedSection/FeaturedSection';
import { AboutSection }    from '@/widgets/AboutSection/AboutSection';
import { EventsSection }   from '@/widgets/EventsSection/EventsSection';
import { GallerySection }  from '@/widgets/GallerySection/GallerySection';
import { CtaSection } from "./CtaSection";

export function HomePage() {
  return (
    <main id="main-content" style={{ minHeight: '100vh' }}>
      <HeroSection />
      <FeaturedSection />
      <AboutSection />
      <EventsSection />
      <GallerySection />
      <CtaSection />
    </main>
  );
}