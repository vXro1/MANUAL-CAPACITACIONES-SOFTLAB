import { HeroSection } from '@/widgets/HeroSection/HeroSection';
import { FeaturedSection } from '@/widgets/FeaturedSection/FeaturedSection';
import { AboutSection } from '@/widgets/AboutSection/AboutSection';
import { ParticipantsSection } from '@/widgets/ParticipantsSection/ParticipantsSection';
import { CtaSection } from './CtaSection';

export function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedSection />
      <AboutSection />
      <ParticipantsSection />
      <CtaSection />
    </main>
  );
}
