
import { useState, useEffect } from 'react';
import { HeroSection }          from '@/widgets/HeroSection/HeroSection';
import { FeaturedSection }      from '@/widgets/FeaturedSection/FeaturedSection';
import { AboutSection }         from '@/widgets/AboutSection/AboutSection';
import { EventsSection }        from '@/widgets/EventsSection/EventsSection';
import { GallerySection }       from '@/widgets/GallerySection/GallerySection';
import { ParticipantsSection }  from '@/widgets/ParticipantsSection/ParticipantsSection';
import { galeriaApi }           from '@/services/apiService';

export function HomePage() {
  // null = loading (parent-controlled), [] = loaded empty
  const [featuredPhotos, setFeaturedPhotos] = useState(null);

  useEffect(() => {
    let cancelled = false;
    galeriaApi.getFeatured()
      .then(data => {
        if (!cancelled) {
          setFeaturedPhotos(
            (data ?? [])
              .slice(0, 15)
              .filter(img => img.src)
              .map(img => ({ src: img.src, alt: img.title || 'Foto del semillero' }))
          );
        }
      })
      .catch(() => { if (!cancelled) setFeaturedPhotos([]); });
    return () => { cancelled = true; };
  }, []);

  const heroSlides = featuredPhotos ? featuredPhotos.slice(0, 5) : [];

  return (
    <main id="main-content" style={{ minHeight: '100vh' }}>
      <HeroSection slides={heroSlides} />
      <FeaturedSection />
      <AboutSection />
      <EventsSection />
      <ParticipantsSection featuredOnly limit={4} />
      <GallerySection photos={featuredPhotos} />
    </main>
  );
}
