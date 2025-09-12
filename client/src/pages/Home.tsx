import Header from '@/components/Header';
import { Hero } from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import ContactSection from '@/components/ContactSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <FeaturesSection />
        <ContactSection />
      </main>
    </div>
  );
}