import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Sections
import HeroLanding from '../components/sections/HeroLanding';
import ServicesShowcase from '../components/sections/ServicesShowcase';
import ProcessTimeline from '../components/sections/ProcessTimeline';
import ProjectsPortfolio from '../components/sections/ProjectsPortfolio';
import TechStack from '../components/sections/TechStack';
import TestimonialsWall from '../components/sections/TestimonialsWall';
import StatsCounter from '../components/sections/StatsCounter';
import CTASection from '../components/sections/CTASection';

const Home = () => {
  useEffect(() => {
    // Refresh ScrollTrigger when component mounts
    ScrollTrigger.refresh();
    
    return () => {
      // Clean up only this page's ScrollTriggers
      // Other sections handle their own cleanup
    };
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <HeroLanding />

      {/* Services Showcase */}
      <ServicesShowcase />

      {/* Process Timeline */}
      <ProcessTimeline />

      {/* Projects Portfolio */}
      <ProjectsPortfolio />

      {/* Tech Stack */}
      <TechStack />

      {/* Testimonials */}
      <TestimonialsWall />

      {/* Stats Counter */}
      <StatsCounter />

      {/* CTA Section */}
      <CTASection />
    </main>
  );
};

export default Home;
