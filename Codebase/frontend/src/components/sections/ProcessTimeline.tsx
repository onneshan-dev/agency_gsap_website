import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Search, 
  FileText, 
  PenTool, 
  Code2, 
  TestTube, 
  Rocket, 
  Settings,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ProcessStep {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  color: string;
}

const steps: ProcessStep[] = [
  {
    id: 'planning',
    number: '01',
    title: 'Planning & Requirement Analysis',
    description: 'Defining project goals, scope, feasibility, and resource allocation to set a solid foundation.',
    icon: <Search className="w-6 h-6" />,
    details: ['Project scoping', 'Feasibility study', 'Resource planning', 'Timeline definition'],
    color: '#10B981',
  },
  {
    id: 'requirements',
    number: '02',
    title: 'Defining Requirements',
    description: 'Documenting clear, actionable requirements through Software Requirement Specification (SRS).',
    icon: <FileText className="w-6 h-6" />,
    details: ['SRS documentation', 'User stories', 'Acceptance criteria', 'Stakeholder approval'],
    color: '#14B8A6',
  },
  {
    id: 'design',
    number: '03',
    title: 'Design & Architecture',
    description: 'Creating the software structure, including UI/UX, database design, and technology stack selection.',
    icon: <PenTool className="w-6 h-6" />,
    details: ['UI/UX design', 'System architecture', 'Database schema', 'Tech stack selection'],
    color: '#6366F1',
  },
  {
    id: 'development',
    number: '04',
    title: 'Development & Implementation',
    description: 'Translating design specifications into actual code, split into modules for different team members.',
    icon: <Code2 className="w-6 h-6" />,
    details: ['Agile sprints', 'Code development', 'Module integration', 'Version control'],
    color: '#8B5CF6',
  },
  {
    id: 'testing',
    number: '05',
    title: 'Testing & Quality Assurance',
    description: 'Verifying the software against requirements to identify and fix bugs, ensuring functionality.',
    icon: <TestTube className="w-6 h-6" />,
    details: ['Unit testing', 'Integration testing', 'User acceptance', 'Performance testing'],
    color: '#EC4899',
  },
  {
    id: 'deployment',
    number: '06',
    title: 'Deployment',
    description: 'Releasing the final product to users, which may involve staging environments and gradual rollout.',
    icon: <Rocket className="w-6 h-6" />,
    details: ['Staging setup', 'CI/CD pipeline', 'Production release', 'Monitoring setup'],
    color: '#F43F5E',
  },
  {
    id: 'maintenance',
    number: '07',
    title: 'Maintenance & Operations',
    description: 'Providing ongoing support, fixing post-release issues, and adding new features as needed.',
    icon: <Settings className="w-6 h-6" />,
    details: ['Bug fixes', 'Feature updates', 'Performance monitoring', '24/7 support'],
    color: '#F97316',
  },
];

// Step Card Component
const StepCard: React.FC<{
  step: ProcessStep;
  isActive: boolean;
  progress: number;
}> = ({ step, isActive, progress }) => {
  return (
    <div
      className={`group relative flex-shrink-0 w-[260px] sm:w-[300px] lg:w-[380px] rounded-2xl overflow-hidden transition-all duration-500 ${
        isActive ? 'scale-105 lg:scale-110 z-10 opacity-100' : 'scale-95 opacity-50'
      }`}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: isActive 
            ? `linear-gradient(135deg, ${step.color}15 0%, rgba(17,24,39,0.95) 100%)`
            : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(10,10,10,0.98) 100%)',
        }}
      />
      
      {/* Border */}
      <div 
        className="absolute inset-0 rounded-2xl p-[1px]"
        style={{
          background: isActive 
            ? `linear-gradient(135deg, ${step.color}50 0%, transparent 60%)`
            : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
        }}
      />

      {/* Progress indicator on card */}
      <div 
        className="absolute top-0 left-0 h-1 rounded-t-2xl transition-all duration-300"
        style={{
          width: isActive ? `${progress * 100}%` : '0%',
          backgroundColor: step.color,
        }}
      />

      <div className="relative p-4 sm:p-5 lg:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500"
            style={{
              background: isActive 
                ? `linear-gradient(135deg, ${step.color}30 0%, ${step.color}15 100%)`
                : 'rgba(255,255,255,0.05)',
              color: isActive ? step.color : 'rgba(255,255,255,0.4)',
              boxShadow: isActive ? `0 0 20px ${step.color}30` : 'none',
            }}
          >
            {step.icon}
          </div>
          <span 
            className="text-2xl font-bold"
            style={{ color: isActive ? `${step.color}60` : 'rgba(255,255,255,0.1)' }}
          >
            {step.number}
          </span>
        </div>

        {/* Title */}
        <h3 className={`text-sm sm:text-base lg:text-lg font-bold mb-2 transition-colors duration-300 ${
          isActive ? 'text-white' : 'text-white/60'
        }`}>
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
          {step.description}
        </p>

        {/* Details */}
        <ul className="space-y-1.5">
          {step.details.slice(0, 3).map((detail, i) => (
            <li 
              key={i}
              className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                isActive ? 'text-white/60' : 'text-white/30'
              }`}
            >
              <Check className="w-3 h-3 flex-shrink-0" style={{ color: isActive ? step.color : 'rgba(255,255,255,0.3)' }} />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ProcessTimeline: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const getCardWidth = useCallback(() => {
    if (typeof window === 'undefined') return 260;
    if (window.innerWidth >= 1024) return 380;
    if (window.innerWidth >= 640) return 300;
    return 260;
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;
    if (!section || !header || !track || !progress) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let resizeTimeout: NodeJS.Timeout;

    // Header animation
    gsap.fromTo(
      header.querySelectorAll('.animate-item'),
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
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
      const gap = 24;
      const cardWidth = getCardWidth();
      const cardTotalWidth = cardWidth + gap;
      const scrollDistance = (steps.length - 1) * cardTotalWidth;
      // Vertical scroll budget: shorter than card pixel width so it scrolls faster
      const pinScrollPx = () => Math.round(window.innerHeight * 1.4);

      // Horizontal scroll animation
      const tween = gsap.to(track, {
        x: () => -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${pinScrollPx()}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          preventOverlaps: true,
          // Magnetic snap: pulls the scroll to the nearest card after any gesture
          snap: {
            snapTo: 1 / (steps.length - 1),
            duration: { min: 0.3, max: 0.5 },
            ease: 'power2.out',
            delay: 0.05,
          },
          onUpdate: (self) => {
            setScrollProgress(self.progress);
            // Round to nearest card so active state snaps cleanly
            const newStep = Math.min(
              Math.round(self.progress * (steps.length - 1)),
              steps.length - 1
            );
            setActiveStep(newStep);
          },
        },
      });

      scrollTriggerRef.current = tween.scrollTrigger as ScrollTrigger;

      // Progress bar animation — same end as main tween
      gsap.to(progress, {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${pinScrollPx()}`,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Handle resize
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          ScrollTrigger.refresh();
        }, 250);
      };

      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
      };
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [getCardWidth]);

  // Touch handling for better mobile experience
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!scrollTriggerRef.current) return;
      
      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      const deltaY = touchStartY - touchY;
      const deltaX = touchStartX - touchX;

      // If vertical scroll is more than horizontal, let default scroll happen
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // Vertical scrolling - the pinned section will handle it
        return;
      }
    };

    section.addEventListener('touchstart', handleTouchStart, { passive: true });
    section.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      section.removeEventListener('touchstart', handleTouchStart);
      section.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative h-screen overflow-hidden flex flex-col pt-20 touch-pan-y"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Dynamic background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${steps[activeStep].color}08 0%, transparent 60%)`,
        }}
      />

      <div className="relative flex flex-col h-full py-4 lg:py-6 overflow-hidden">
        {/* Header */}
        <div ref={headerRef} className="section-padding max-w-7xl mx-auto mb-4 lg:mb-8 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-6">
            <div>
              <div className="animate-item inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-white/50">Our Process</span>
              </div>
              <h2 className="animate-item text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                How We <span className="text-gradient">Build</span>
              </h2>
              <p className="animate-item text-white/50 text-sm max-w-xl leading-relaxed">
                A proven 7-step methodology for exceptional results.
              </p>
            </div>

            {/* Progress indicator */}
            <div className="animate-item">
              <div className="flex items-center gap-4">
                <span className="text-white/40 text-sm">Step</span>
                <span className="text-xl lg:text-2xl font-bold text-white">{activeStep + 1}</span>
                <span className="text-white/30">/</span>
                <span className="text-white/40">{steps.length}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="animate-item mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              ref={progressRef}
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${scrollProgress * 100}%`,
                background: `linear-gradient(90deg, ${steps.map(s => s.color).join(', ')})`,
              }}
            />
          </div>
        </div>

        {/* Cards Track - Horizontal scroll on all devices */}
        <div 
          ref={trackRef}
          className="flex gap-4 sm:gap-6 lg:gap-8 flex-1 items-center min-h-0 px-4 sm:px-6"
          style={{ 
            perspective: '1000px',
            paddingLeft: 'max(16px, calc(50vw - 130px))',
            paddingRight: 'max(16px, calc(50vw - 130px))',
          }}
        >
          {steps.map((step, index) => (
            <div key={step.id} className="step-card-wrapper">
              <StepCard
                step={step}
                isActive={activeStep === index}
                progress={activeStep === index ? (scrollProgress * steps.length - index) : 0}
              />
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="flex items-center justify-center mt-4 gap-2 text-white/30 flex-shrink-0 pb-2">
          <span className="text-xs">Scroll to explore</span>
          <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
