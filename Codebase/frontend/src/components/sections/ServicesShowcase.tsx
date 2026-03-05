import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Globe, 
  Smartphone, 
  Brain, 
  ArrowRight, 
  Sparkles,
  Zap,
  Code2,
  Layers,
  ArrowUpRight,
  Cpu,
  Database,
  Cloud,
  ChevronRight,
  Star
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
  techStack: string[];
}

const services: Service[] = [
  {
    id: 'web',
    title: 'Web Development',
    subtitle: 'Modern Web Solutions',
    description: 'We build blazing-fast, scalable web applications using cutting-edge technologies that captivate users and drive business growth.',
    icon: <Globe className="w-10 h-10" />,
    features: [
      'React & Next.js Architecture',
      'Performance Optimization',
      'Scalable Backend Systems',
      'Progressive Web Apps',
    ],
    color: '#10B981',
    techStack: ['React', 'Next.js', 'Node.js', 'TypeScript'],
  },
  {
    id: 'app',
    title: 'App Development',
    subtitle: 'Mobile-First Design',
    description: 'Native and cross-platform mobile applications that deliver exceptional user experiences on every device.',
    icon: <Smartphone className="w-10 h-10" />,
    features: [
      'iOS & Android Native',
      'React Native & Flutter',
      'Smooth 60fps Animations',
      'Offline-First Architecture',
    ],
    color: '#6366F1',
    techStack: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
  },
  {
    id: 'ai',
    title: 'AI & Automation',
    subtitle: 'Intelligent Systems',
    description: 'Leverage the power of artificial intelligence to automate processes and create intelligent applications.',
    icon: <Brain className="w-10 h-10" />,
    features: [
      'Machine Learning Models',
      'Natural Language Processing',
      'Process Automation',
      'Predictive Analytics',
    ],
    color: '#EC4899',
    techStack: ['Python', 'TensorFlow', 'OpenAI', 'PyTorch'],
  },
];

const ServicesShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const cardsContainer = cardsContainerRef.current;
    
    if (!section || !header || !cardsContainer) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const ctx = gsap.context(() => {
      // Header entrance animation
      gsap.fromTo(
        header.querySelectorAll('.animate-item'),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      if (!prefersReducedMotion) {
        // Get all service cards
        const cards = cardsContainer.querySelectorAll('.service-card');
        
        // Create main timeline for scroll
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: `+=${services.length * 100}%`,
            pin: true,
            scrub: 1,
            snap: {
              snapTo: 1 / (services.length),
              duration: { min: 0.2, max: 0.5 },
              ease: 'power1.inOut',
            },
            onUpdate: (self) => {
              const newIndex = Math.min(
                services.length - 1,
                Math.floor(self.progress * services.length)
              );
              setActiveIndex(newIndex);
            },
          },
        });

        // Set initial states
        gsap.set(cards, { 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%',
          opacity: 0,
          scale: 0.9,
          y: 100,
        });
        gsap.set(cards[0], { opacity: 1, scale: 1, y: 0 });

        // Animate each card transition
        cards.forEach((card, index) => {
          if (index === 0) return; // Skip first card

          const prevCard = cards[index - 1];
          
          // Previous card exits
          scrollTl.to(prevCard, {
            opacity: 0,
            scale: 0.92,
            y: -80,
            duration: 1,
            ease: 'power2.inOut',
          }, index - 1);

          // Current card enters
          scrollTl.to(card, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            ease: 'power2.inOut',
          }, index - 1);
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative bg-[#0a0f1c] h-screen overflow-hidden flex flex-col pt-20"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dynamic Gradient Orb */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, ${services[activeIndex]?.color} 0%, transparent 70%)`,
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Progress Indicator - Desktop Only */}
      <div className="hidden lg:flex fixed right-6 lg:right-10 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-3">
        {services.map((service, index) => (
          <div key={service.id} className="relative group">
            <div 
              className={`w-2 h-10 rounded-full overflow-hidden transition-all duration-500 ${
                index === activeIndex ? 'bg-white/20' : 'bg-white/5'
              }`}
              style={{
                boxShadow: index === activeIndex ? `0 0 20px ${service.color}50` : 'none',
              }}
            >
              <div 
                className="w-full transition-all duration-500"
                style={{
                  height: index === activeIndex ? '100%' : index < activeIndex ? '100%' : '0%',
                  backgroundColor: service.color,
                  opacity: index <= activeIndex ? 1 : 0.3,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div ref={headerRef} className="relative pt-2 lg:pt-4 pb-2 lg:pb-4 text-center flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="animate-item inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-2">
            <Layers className="w-3.5 h-3.5" style={{ color: services[activeIndex]?.color }} />
            <span className="text-xs text-white/60">Our Expertise</span>
          </div>

          {/* Title */}
          <h2 className="animate-item text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 tracking-tight">
            Services That{' '}
            <span 
              className="bg-clip-text text-transparent transition-all duration-500"
              style={{
                backgroundImage: `linear-gradient(135deg, ${services[activeIndex]?.color} 0%, #fff 50%, ${services[activeIndex]?.color} 100%)`,
              }}
            >
              Deliver
            </span>
          </h2>

          {/* Subtitle */}
          <p className="animate-item text-white/40 text-xs lg:text-sm max-w-xl mx-auto">
            Transforming ideas into powerful digital solutions.
          </p>

          {/* Mobile Progress Dots */}
          <div className="flex lg:hidden items-center justify-center gap-2 mt-3">
            {services.map((service, index) => (
              <button
                key={service.id}
                onClick={() => {
                  const section = sectionRef.current;
                  if (section) {
                    const scrollTriggers = ScrollTrigger.getAll().filter(st => st.trigger === section);
                    scrollTriggers.forEach(st => st.scroll(index / services.length * st.end));
                  }
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'w-6' : 'w-1.5 bg-white/20'
                }`}
                style={{
                  backgroundColor: index === activeIndex ? service.color : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div 
        ref={cardsContainerRef}
        className="relative flex-1 min-h-0"
      >
        {services.map((service, index) => (
          <div
            key={service.id}
            className="service-card absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8"
            style={{ zIndex: services.length - index }}
          >
            <div className="w-full max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-3 lg:gap-8 items-center h-full py-1 lg:py-4">
                {/* Left Content */}
                <div className="order-2 lg:order-1">
                  {/* Service Number & Line - Hidden on mobile */}
                  <div className="hidden lg:flex items-center gap-3 mb-3">
                    <span 
                      className="text-5xl lg:text-6xl font-bold opacity-10"
                      style={{ color: service.color }}
                    >
                      0{index + 1}
                    </span>
                    <div 
                      className="h-px flex-grow max-w-[80px]"
                      style={{ 
                        background: `linear-gradient(90deg, ${service.color}60 0%, transparent 100%)` 
                      }}
                    />
                  </div>

                  {/* Subtitle Badge */}
                  <div 
                    className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border mb-2"
                    style={{ 
                      borderColor: `${service.color}30`,
                      backgroundColor: `${service.color}10`,
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" style={{ color: service.color }} />
                    <span className="text-xs font-medium" style={{ color: service.color }}>
                      {service.subtitle}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl lg:text-3xl xl:text-4xl font-bold text-white mb-2 leading-tight">
                    {service.title}
                  </h3>

                  {/* Description - Shorter on mobile */}
                  <p className="text-xs lg:text-base text-white/60 mb-3 leading-relaxed max-w-lg">
                    {service.description}
                  </p>

                  {/* Features Grid - 2 columns on mobile */}
                  <div className="grid grid-cols-2 gap-1.5 lg:gap-2 mb-3">
                    {service.features.map((feature, fIndex) => (
                      <div 
                        key={fIndex}
                        className="flex items-start gap-2 group"
                      >
                        <div 
                          className="w-4 h-4 lg:w-5 lg:h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-110"
                          style={{ backgroundColor: `${service.color}20` }}
                        >
                          <Zap className="w-2.5 h-2.5 lg:w-3 lg:h-3" style={{ color: service.color }} />
                        </div>
                        <span className="text-xs lg:text-sm text-white/70 group-hover:text-white transition-colors leading-tight">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-1.5 mb-3 lg:mb-5">
                    {service.techStack.map((tech, tIndex) => (
                      <span
                        key={tIndex}
                        className="px-2 py-0.5 rounded text-[10px] font-medium text-white/50 bg-white/5 border border-white/10 hover:border-white/20 hover:text-white transition-all"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button 
                    className="group relative inline-flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl font-semibold text-xs overflow-hidden transition-all duration-300 hover:scale-105"
                    style={{ 
                      backgroundColor: `${service.color}15`,
                      color: service.color,
                      border: `1px solid ${service.color}30`,
                    }}
                  >
                    <div 
                      className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                      style={{ backgroundColor: service.color }}
                    />
                    <span className="relative z-10 group-hover:text-white transition-colors">
                      Explore Service
                    </span>
                    <ArrowRight className="relative z-10 w-3.5 h-3.5 lg:w-4 lg:h-4 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </button>
                </div>

                {/* Right Visual */}
                <div className="order-1 lg:order-2 relative">
                  <div className="relative aspect-[4/3] lg:aspect-square max-w-[280px] lg:max-w-md mx-auto">
                    {/* Background Glow */}
                    <div 
                      className="absolute inset-0 rounded-2xl lg:rounded-3xl blur-3xl opacity-30 transition-all duration-500"
                      style={{ 
                        background: `radial-gradient(circle, ${service.color}40 0%, transparent 70%)`,
                        transform: index === activeIndex ? 'scale(1)' : 'scale(0.8)',
                      }}
                    />

                    {/* Main Card */}
                    <div 
                      className="relative h-full rounded-2xl lg:rounded-3xl overflow-hidden border backdrop-blur-sm transition-all duration-500"
                      style={{ 
                        borderColor: `${service.color}20`,
                        backgroundColor: `${service.color}05`,
                      }}
                    >
                      {/* Inner Gradient */}
                      <div 
                        className="absolute inset-0 opacity-50"
                        style={{
                          background: `linear-gradient(135deg, ${service.color}15 0%, transparent 60%)`,
                        }}
                      />

                      {/* Icon Container */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="w-14 h-14 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-xl lg:rounded-2xl flex items-center justify-center relative transition-transform duration-500"
                          style={{
                            background: `linear-gradient(135deg, ${service.color}25 0%, ${service.color}05 100%)`,
                            boxShadow: `0 0 30px ${service.color}30`,
                            transform: index === activeIndex ? 'scale(1)' : 'scale(0.9)',
                          }}
                        >
                          <div style={{ color: service.color }} className="scale-50 lg:scale-75 xl:scale-90">
                            {service.icon}
                          </div>
                          
                          {/* Rotating Ring */}
                          <div 
                            className="absolute inset-0 rounded-xl lg:rounded-3xl border-2 border-dashed border-white/20"
                            style={{ 
                              animation: index === activeIndex ? 'spin 20s linear infinite' : 'none',
                            }}
                          />
                        </div>
                      </div>

                      {/* Corner Dots */}
                      <div className="absolute top-3 left-3 lg:top-5 lg:left-5 flex items-center gap-1 lg:gap-1.5">
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full" style={{ backgroundColor: service.color }} />
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white/20" />
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white/20" />
                      </div>

                      {/* Stats Badge */}
                      <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 px-2 py-1 lg:px-2.5 lg:py-1.5 rounded-md lg:rounded-lg bg-white/10 backdrop-blur-md border border-white/10">
                        <div className="flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 lg:w-3 lg:h-3" style={{ color: service.color }} />
                          <span className="text-white text-[10px] lg:text-xs font-semibold">
                            {index === 0 ? '100+' : index === 1 ? '50+' : '30+'}
                          </span>
                          <span className="text-white/50 text-[8px] lg:text-[10px]">
                            {index === 0 ? 'Projects' : index === 1 ? 'Apps' : 'Models'}
                          </span>
                        </div>
                      </div>

                      {/* Floating Tech Icons - Hidden on small mobile */}
                      <div 
                        className="hidden sm:flex absolute top-1/4 right-2 lg:right-3 w-6 h-6 lg:w-8 lg:h-8 rounded-md lg:rounded-lg bg-white/5 backdrop-blur items-center justify-center border border-white/10"
                        style={{ animation: 'float 4s ease-in-out infinite' }}
                      >
                        <Code2 className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-white/40" />
                      </div>
                      <div 
                        className="hidden sm:flex absolute bottom-1/3 left-2 lg:left-3 w-5 h-5 lg:w-7 lg:h-7 rounded-md lg:rounded-lg bg-white/5 backdrop-blur items-center justify-center border border-white/10"
                        style={{ animation: 'float 4s ease-in-out infinite 1s' }}
                      >
                        <Database className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-white/40" />
                      </div>
                    </div>

                    {/* Floating Badges - Hidden on mobile */}
                    <div 
                      className="hidden lg:block absolute -top-2 -right-2 px-2 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-white/80"
                      style={{ animation: 'float 5s ease-in-out infinite 0.5s' }}
                    >
                      <div className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" style={{ color: service.color }} />
                        <span>High Performance</span>
                      </div>
                    </div>

                    <div 
                      className="hidden lg:block absolute -bottom-2 -left-2 px-2 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-white/80"
                      style={{ animation: 'float 5s ease-in-out infinite 1.5s' }}
                    >
                      <div className="flex items-center gap-1">
                        <Cloud className="w-3 h-3" style={{ color: service.color }} />
                        <span>Cloud Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA - Compact on mobile */}
      <div className="relative py-2 lg:py-5 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-xl lg:rounded-2xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-pink-500/10" />
            <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.02]" />
            
            {/* Border */}
            <div className="absolute inset-0 rounded-xl lg:rounded-2xl p-[1px]">
              <div className="absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-r from-emerald-500/30 via-indigo-500/30 to-pink-500/30" />
              <div className="absolute inset-[1px] rounded-xl lg:rounded-2xl bg-[#0a0f1c]/95" />
            </div>

            <div className="relative px-3 py-3 lg:px-8 lg:py-5 text-center">
              <h3 className="text-sm lg:text-xl font-bold text-white mb-2">
                Ready to Start Your Project?
              </h3>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <button 
                  className="group relative inline-flex items-center gap-1.5 lg:gap-2 px-3 py-2 lg:px-4 lg:py-2 bg-emerald-500 text-gray-900 font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 text-xs"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <Sparkles className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                  <span className="relative">Get Free Consultation</span>
                  <ArrowUpRight className="w-3 h-3 lg:w-3.5 lg:h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>

                <button 
                  className="inline-flex items-center gap-1.5 lg:gap-2 px-3 py-2 lg:px-4 lg:py-2 rounded-lg font-semibold text-white border border-white/20 hover:bg-white/5 transition-all duration-300 text-xs"
                  onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Our Work
                  <ChevronRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesShowcase;
