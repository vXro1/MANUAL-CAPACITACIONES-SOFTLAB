import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { ManualCardFeatured } from '@/widgets/ManualCard/ManualCard';
import { manualsRepository } from '@/storage/localStorageRepository';
import { Button } from '@/shared/ui/Button';

export function FeaturedSection() {
  const featured = manualsRepository.getFeatured().slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionTitle
            label="Destacados"
            title="Manuales más recientes"
            description="Las capacitaciones más relevantes documentadas por el equipo Softlab."
          />
          <Link to="/manuales">
            <Button variant="secondary" size="md" iconRight={ArrowRight}>
              Ver todos
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-5">
          {featured.map((manual, i) => (
            <motion.div
              key={manual.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <ManualCardFeatured manual={manual} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
