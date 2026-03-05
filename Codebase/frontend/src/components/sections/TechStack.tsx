import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Tech {
  name: string;
  icon: string;
  color: string;
}

const allTechs: Tech[] = [
  { name: 'React',       icon: '⚛️', color: '#10B981' },
  { name: 'Next.js',     icon: '▲',  color: '#10B981' },
  { name: 'TypeScript',  icon: '🔷', color: '#10B981' },
  { name: 'Vue.js',      icon: '💚', color: '#10B981' },
  { name: 'Tailwind CSS',icon: '🌊', color: '#10B981' },
  { name: 'Node.js',     icon: '🟢', color: '#6366F1' },
  { name: 'Python',      icon: '🐍', color: '#6366F1' },
  { name: 'Go',          icon: '🔵', color: '#6366F1' },
  { name: 'PostgreSQL',  icon: '🐘', color: '#6366F1' },
  { name: 'MongoDB',     icon: '🍃', color: '#6366F1' },
  { name: 'AWS',         icon: '☁️', color: '#EC4899' },
  { name: 'Docker',      icon: '🐳', color: '#EC4899' },
  { name: 'Kubernetes',  icon: '☸️', color: '#EC4899' },
  { name: 'Redis',       icon: '🔴', color: '#EC4899' },
  { name: 'Firebase',    icon: '🔥', color: '#EC4899' },
  { name: 'TensorFlow',  icon: '🧠', color: '#38BDF8' },
  { name: 'OpenAI',      icon: '🤖', color: '#38BDF8' },
  { name: 'Flutter',     icon: '💙', color: '#38BDF8' },
  { name: 'Swift',       icon: '🍎', color: '#38BDF8' },
  { name: 'Kotlin',      icon: '🟣', color: '#38BDF8' },
];

// 3 rows: different slices + speed + direction
const rows: { items: Tech[]; reverse: boolean; speed: number }[] = [
  { items: allTechs.slice(0, 10),  reverse: false, speed: 30 }, // Frontend + Backend →
  { items: allTechs.slice(5, 15),  reverse: true,  speed: 38 }, // Backend + Cloud ←
  { items: allTechs.slice(10, 20), reverse: false, speed: 25 }, // Cloud + AI → (faster)
];

const categories = [
  { name: 'Frontend',     color: '#10B981', count: 5 },
  { name: 'Backend',      color: '#6366F1', count: 5 },
  { name: 'Cloud',        color: '#EC4899', count: 5 },
  { name: 'AI & Mobile',  color: '#38BDF8', count: 5 },
];

const TechPill: React.FC<{ tech: Tech }> = ({ tech }) => (
  <div
    className="group flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-full
      bg-white/[0.04] border border-white/[0.08]
      hover:bg-white/[0.09] hover:border-white/[0.18]
      hover:scale-105 transition-all duration-200 cursor-default"
  >
    <span className="text-lg leading-none grayscale group-hover:grayscale-0 transition-all duration-300">
      {tech.icon}
    </span>
    <span className="text-white/55 group-hover:text-white/90 text-sm font-medium whitespace-nowrap transition-colors duration-200">
      {tech.name}
    </span>
    <div
      className="w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
      style={{ backgroundColor: tech.color }}
    />
  </div>
);

const TechStack: React.FC = () => {
  const sectionRef  = useRef<HTMLElement>(null);
  const headerRef   = useRef<HTMLDivElement>(null);
  const orb1Ref     = useRef<HTMLDivElement>(null);
  const orb2Ref     = useRef<HTMLDivElement>(null);
  const rowRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const catRefs     = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating background orbs
      gsap.to(orb1Ref.current, {
        y: '+=40', x: '+=25',
        duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
      gsap.to(orb2Ref.current, {
        y: '-=30', x: '-=20',
        duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut',
        delay: 1.5,
      });

      // Header stagger
      gsap.fromTo(
        headerRef.current?.querySelectorAll('.animate-item') ?? [],
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Each marquee row fades in from bottom with stagger offset
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        gsap.fromTo(
          row,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0,
            duration: 0.75, ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 92%',
              toggleActions: 'play none none reverse',
            },
            delay: i * 0.1,
          }
        );
      });

      // Category pills pop in
      const cats = catRefs.current.filter(Boolean) as HTMLDivElement[];
      if (cats.length) {
        gsap.fromTo(
          cats,
          { y: 20, opacity: 0, scale: 0.88 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.5, stagger: 0.07, ease: 'back.out(1.6)',
            scrollTrigger: {
              trigger: cats[0],
              start: 'top 92%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ backgroundColor: '#0a0f1c' }}
    >
      {/* Animated ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          ref={orb1Ref}
          className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[560px] h-[560px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          ref={orb2Ref}
          className="absolute top-1/3 right-1/5 w-[380px] h-[380px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="relative">
        {/* Header */}
        <div ref={headerRef} className="section-padding max-w-7xl mx-auto text-center mb-14">
          <div className="animate-item inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/60">Our Stack</span>
          </div>

          <h2 className="animate-item text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Technologies We <span className="text-gradient">Love</span>
          </h2>

          <p className="animate-item text-white/45 max-w-xl mx-auto text-sm leading-relaxed">
            20+ cutting-edge tools — from frontend to AI — powering every product we ship.
          </p>
        </div>

        {/* Three marquee rows */}
        <div className="flex flex-col gap-3.5">
          {rows.map((row, rowIdx) => (
            <div
              key={rowIdx}
              ref={(el) => { rowRefs.current[rowIdx] = el; }}
              className="overflow-hidden"
              style={{
                maskImage:
                  'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
              }}
            >
              <div
                className={`flex gap-3 ${row.reverse ? 'marquee-row-reverse' : 'marquee-row'}`}
                style={{ animationDuration: `${row.speed}s` }}
              >
                {/* Two copies for seamless loop */}
                {[...row.items, ...row.items].map((tech, i) => (
                  <TechPill key={`${tech.name}-${rowIdx}-${i}`} tech={tech} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Category summary pills */}
        <div className="section-padding max-w-7xl mx-auto mt-14">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat, i) => (
              <div
                key={cat.name}
                ref={(el) => { catRefs.current[i] = el; }}
                className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition-all duration-300 cursor-default"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-white/50 text-xs font-medium">{cat.name}</span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ color: cat.color, background: `${cat.color}18` }}
                >
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
