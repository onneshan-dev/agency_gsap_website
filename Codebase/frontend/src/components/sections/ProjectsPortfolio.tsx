import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Github, ExternalLink, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  color: string;
  stats: { label: string; value: string }[];
  year: string;
}

const projects: Project[] = [
  {
    id: '01',
    title: 'Nexus Commerce',
    category: 'E-Commerce Platform',
    description: 'AI-powered e-commerce with real-time inventory, smart recommendations, and seamless checkout at enterprise scale.',
    tags: ['Next.js', 'PostgreSQL', 'Redis', 'Stripe', 'TensorFlow'],
    color: '#10B981',
    stats: [{ label: 'Revenue', value: '+340%' }, { label: 'Active Users', value: '2.5M' }],
    year: '2024',
  },
  {
    id: '02',
    title: 'FitTrack Pro',
    category: 'Mobile Fitness App',
    description: 'Cross-platform fitness tracking with personalized workout plans, nutrition logs, and social challenges.',
    tags: ['React Native', 'Firebase', 'HealthKit', 'Node.js'],
    color: '#6366F1',
    stats: [{ label: 'Downloads', value: '500K+' }, { label: 'App Rating', value: '4.9★' }],
    year: '2024',
  },
  {
    id: '03',
    title: 'ContentForge AI',
    category: 'AI Content Platform',
    description: 'Enterprise AI platform generating high-quality content at scale with brand voice adaptation and custom model training.',
    tags: ['Python', 'OpenAI', 'FastAPI', 'Vue.js', 'AWS'],
    color: '#EC4899',
    stats: [{ label: 'Content Pieces', value: '10M+' }, { label: 'Time Saved', value: '85%' }],
    year: '2023',
  },
  {
    id: '04',
    title: 'FinDash Analytics',
    category: 'Fintech Dashboard',
    description: 'Real-time financial analytics with predictive modeling and automated risk assessment for institutional investors.',
    tags: ['React', 'D3.js', 'Node.js', 'WebSocket', 'PostgreSQL'],
    color: '#38BDF8',
    stats: [{ label: 'Data / Day', value: '50M+' }, { label: 'Accuracy', value: '99.9%' }],
    year: '2023',
  },
];

const ProjectCard: React.FC<{ project: Project; featured?: boolean }> = ({
  project,
  featured = false,
}) => {
  return (
    <div
      className="project-card group relative flex flex-col h-full overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1"
      style={{
        background: `linear-gradient(145deg, ${project.color}0A 0%, #0a0f1c 55%)`,
        border: `1px solid ${project.color}1A`,
        boxShadow: `0 0 0 0 ${project.color}00`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 60px ${project.color}18, 0 0 0 1px ${project.color}30`;
        (e.currentTarget as HTMLDivElement).style.borderColor = `${project.color}35`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 ${project.color}00`;
        (e.currentTarget as HTMLDivElement).style.borderColor = `${project.color}1A`;
      }}
    >
      {/* Top accent — scaleX transform, no layout cost */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        style={{ background: `linear-gradient(90deg, ${project.color}, ${project.color}40)` }}
      />

      {/* Faded number watermark */}
      <span
        className="absolute -bottom-6 -right-3 text-[120px] lg:text-[150px] font-black select-none pointer-events-none leading-none"
        style={{ color: `${project.color}07` }}
      >
        {project.id}
      </span>

      <div className={`relative flex flex-col h-full ${featured ? 'p-7 lg:p-9' : 'p-6 lg:p-7'}`}>
        {/* Top row */}
        <div className="flex items-center justify-between mb-6">
          <span
            className="text-xs font-medium px-3 py-1.5 rounded-full border"
            style={{
              color: project.color,
              borderColor: `${project.color}30`,
              background: `${project.color}0E`,
            }}
          >
            {project.category}
          </span>
          <span className="text-white/25 text-xs font-mono tracking-widest">{project.year}</span>
        </div>

        {/* Title + description */}
        <div className="flex-1 mb-6">
          <h3
            className={`font-bold text-white leading-tight mb-3 transition-colors duration-300 group-hover:text-white ${
              featured ? 'text-2xl lg:text-3xl' : 'text-xl lg:text-2xl'
            }`}
          >
            {project.title}
          </h3>
          <p className="text-white/45 text-sm leading-relaxed line-clamp-3">{project.description}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-5">
          {project.stats.map((stat, i) => (
            <div key={i}>
              <div className="text-lg font-bold" style={{ color: project.color }}>
                {stat.value}
              </div>
              <div className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.tags.slice(0, featured ? 5 : 4).map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 text-[11px] rounded-md bg-white/[0.04] text-white/45 border border-white/[0.07] hover:text-white/75 hover:border-white/20 transition-colors duration-200"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-3 pt-5 border-t"
          style={{ borderColor: `${project.color}12` }}
        >
          <button
            className="flex items-center gap-1.5 text-sm font-semibold group/btn"
            style={{ color: project.color }}
          >
            <span>View Project</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </button>
          <div className="flex gap-2 ml-auto">
            <button className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-200">
              <Github className="w-3.5 h-3.5 text-white/50" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-200">
              <ExternalLink className="w-3.5 h-3.5 text-white/50" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectsPortfolio: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header items stagger in
      gsap.fromTo(
        headerRef.current?.querySelectorAll('.animate-item') ?? [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards batch animate — far more efficient than per-element ScrollTriggers
      ScrollTrigger.batch('.project-card', {
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: 48, opacity: 0, scale: 0.97 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.65,
              stagger: 0.08,
              ease: 'power3.out',
            }
          ),
        start: 'top 90%',
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative py-20 lg:py-28"
      style={{ backgroundColor: '#0a0f1c' }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.022] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative section-padding max-w-7xl mx-auto">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-12 lg:mb-14"
        >
          <div>
            <div className="animate-item inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white/60">Portfolio</span>
            </div>
            <h2 className="animate-item text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Our <span className="text-gradient">Work</span>
            </h2>
            <p className="animate-item text-white/40 mt-3 max-w-lg text-sm leading-relaxed">
              A selection of projects that shaped businesses and delighted users.
            </p>
          </div>

          <div className="animate-item flex items-center gap-3 text-white/20 text-sm">
            <span className="font-mono text-3xl font-bold text-white/10">
              {String(projects.length).padStart(2, '0')}
            </span>
            <span>Projects</span>
          </div>
        </div>

        {/* Bento grid — no pin, no massive scroll distance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
          {/* Row 1: Card 1 wide (2 cols) + Card 2 narrow */}
          <div className="lg:col-span-2 min-h-[320px] lg:min-h-[370px]">
            <ProjectCard project={projects[0]} featured />
          </div>
          <div className="min-h-[280px] lg:min-h-[370px]">
            <ProjectCard project={projects[1]} />
          </div>

          {/* Row 2: Card 3 narrow + Card 4 wide (2 cols) */}
          <div className="min-h-[280px] lg:min-h-[350px]">
            <ProjectCard project={projects[2]} />
          </div>
          <div className="lg:col-span-2 min-h-[280px] lg:min-h-[350px]">
            <ProjectCard project={projects[3]} featured />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsPortfolio;
