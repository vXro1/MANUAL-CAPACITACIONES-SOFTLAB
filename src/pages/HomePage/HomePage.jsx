
import { useState, useEffect } from 'react';
import { HeroSection }          from '@/widgets/HeroSection/HeroSection';
import { FeaturedSection }      from '@/widgets/FeaturedSection/FeaturedSection';
import { AboutSection }         from '@/widgets/AboutSection/AboutSection';
import { EventsSection }        from '@/widgets/EventsSection/EventsSection';
import { GallerySection }       from '@/widgets/GallerySection/GallerySection';
import { ParticipantsSection }  from '@/widgets/ParticipantsSection/ParticipantsSection';
import { galeriaApi }           from '@/services/apiService';

export function HomePage() {
  // null = cargando, [] = cargado vacío
  const [heroPhotos, setHeroPhotos] = useState(null);
  const [joinPhotos, setJoinPhotos] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Carrusel principal: imágenes configuradas en la sección hero (hasta 5)
    galeriaApi.getSection('hero')
      .then(data => {
        if (!cancelled) {
          setHeroPhotos(
            (data ?? [])
              .filter(img => img.src)
              .map(img => ({ src: img.src, alt: img.title || 'Foto del semillero' }))
          );
        }
      })
      .catch(() => { if (!cancelled) setHeroPhotos([]); });

    // Sección "Por qué unirse": imágenes configuradas en join (hasta 6)
    galeriaApi.getSection('join')
      .then(data => {
        if (!cancelled) {
          setJoinPhotos(
            (data ?? [])
              .filter(img => img.src)
              .map(img => ({ src: img.src, alt: img.title || 'Foto del semillero' }))
          );
        }
      })
      .catch(() => { if (!cancelled) setJoinPhotos([]); });

    return () => { cancelled = true; };
  }, []);

  return (
    <main id="main-content" style={{ minHeight: '100vh' }}>
      <HeroSection slides={heroPhotos ?? []} />
      <FeaturedSection />
      <AboutSection />
      <EventsSection />
      <ParticipantsSection
        featuredOnly
        skipPonentes
        sectionTitle="Estudiantes Destacados"
        sectionSubtitle="Reconocimiento"
      />
      <GallerySection photos={joinPhotos} />
    </main>
  );
}
