import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Users, 
  Target, 
  Rocket, 
  Heart,
  Lightbulb,
  Shield,
  Sparkles,
  ArrowRight,
  Briefcase,
  Code2,
  Palette,
  Bug,
  LineChart,
  Clock,
  Layout,
  ArrowUpRight,
  Globe,
  Zap,
  Award
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Key Roles Data
const keyRoles = [
  {
    title: 'Product Manager (PM)',
    description: 'Defines the product vision and strategy.',
    icon: <Briefcase className="w-6 h-6" />,
    color: '#10B981',
    responsibilities: [
      'Define product roadmap and strategy',
      'Gather and prioritize requirements',
      'Coordinate with stakeholders',
      'Ensure product-market fit',
    ],
  },
  {
    title: 'Project Manager / Scrum Master',
    description: 'Manages timelines, resources, and agile processes.',
    icon: <Clock className="w-6 h-6" />,
    color: '#6366F1',
    responsibilities: [
      'Manage project timelines and milestones',
      'Facilitate agile ceremonies',
      'Remove team blockers',
      'Ensure on-time delivery',
    ],
  },
  {
    title: 'Software Architect',
    description: 'Designs the technical structure and framework.',
    icon: <Layout className="w-6 h-6" />,
    color: '#EC4899',
    responsibilities: [
      'Design system architecture',
      'Choose technology stack',
      'Ensure scalability and performance',
      'Guide technical decisions',
    ],
  },
  {
    title: 'Developers',
    description: 'Frontend/Backend/Full-stack - Write code to build features.',
    icon: <Code2 className="w-6 h-6" />,
    color: '#38BDF8',
    responsibilities: [
      'Write clean, maintainable code',
      'Implement features and functionality',
      'Code reviews and optimization',
      'Collaborate with designers',
    ],
  },
  {
    title: 'UI/UX Designers',
    description: 'Create user-friendly interfaces.',
    icon: <Palette className="w-6 h-6" />,
    color: '#F59E0B',
    responsibilities: [
      'Design intuitive user interfaces',
      'Create wireframes and prototypes',
      'Conduct user research',
      'Ensure accessibility standards',
    ],
  },
  {
    title: 'QA Engineers',
    description: 'Test for bugs and ensure quality standards.',
    icon: <Bug className="w-6 h-6" />,
    color: '#EF4444',
    responsibilities: [
      'Write and execute test cases',
      'Perform manual and automated testing',
      'Report and track bugs',
      'Ensure quality standards',
    ],
  },
  {
    title: 'Business Analyst (BA)',
    description: 'Gathers requirements and analyzes business needs.',
    icon: <LineChart className="w-6 h-6" />,
    color: '#8B5CF6',
    responsibilities: [
      'Gather business requirements',
      'Analyze and document processes',
      'Bridge business and technical teams',
      'Validate solution alignment',
    ],
  },
];

// Company Values
const values = [
  {
    title: 'Innovation',
    description: 'We push boundaries and embrace new technologies to deliver cutting-edge solutions.',
    icon: <Lightbulb className="w-6 h-6" />,
    color: '#10B981',
  },
  {
    title: 'Quality',
    description: 'Excellence is non-negotiable. We deliver products that exceed expectations.',
    icon: <Shield className="w-6 h-6" />,
    color: '#6366F1',
  },
  {
    title: 'Collaboration',
    description: 'Great products are built by great teams working together seamlessly.',
    icon: <Users className="w-6 h-6" />,
    color: '#EC4899',
  },
  {
    title: 'Client-First',
    description: 'Your success is our success. We prioritize your business goals above all.',
    icon: <Heart className="w-6 h-6" />,
    color: '#F59E0B',
  },
];

// Stats for hero
const heroStats = [
  { number: '150+', label: 'Projects', icon: <Rocket className="w-5 h-5" /> },
  { number: '50+', label: 'Clients', icon: <Globe className="w-5 h-5" /> },
  { number: '7+', label: 'Years', icon: <Award className="w-5 h-5" /> },
  { number: '99%', label: 'Satisfaction', icon: <Zap className="w-5 h-5" /> },
];

const About: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    const hero = heroRef.current;
    if (!page || !hero) return;

    // Store local ScrollTriggers
    const localTriggers: ScrollTrigger[] = [];

    // Hero entrance animation
    const heroTl = gsap.timeline({ delay: 0.3 });
    
    heroTl.fromTo(
      hero.querySelectorAll('.hero-badge'),
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    )
    .fromTo(
      hero.querySelectorAll('.hero-title'),
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.2'
    )
    .fromTo(
      hero.querySelectorAll('.hero-subtitle'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
      '-=0.5'
    )
    .fromTo(
      hero.querySelectorAll('.hero-cta'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo(
      hero.querySelectorAll('.hero-stat'),
      { y: 40, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.7)' },
      '-=0.3'
    )
    .fromTo(
      hero.querySelectorAll('.hero-visual'),
      { scale: 0.8, opacity: 0, rotation: -5 },
      { scale: 1, opacity: 1, rotation: 0, duration: 1, ease: 'power3.out' },
      '-=0.8'
    );

    // Section animations
    const sections = page.querySelectorAll('.section-animate');
    sections.forEach((section) => {
      const tween = gsap.fromTo(
        section.querySelectorAll('.item-animate'),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
      if (tween.scrollTrigger) localTriggers.push(tween.scrollTrigger);
    });

    return () => {
      localTriggers.forEach((st) => st.kill());
    };
  }, []);

  const scrollToRoles = () => {
    const element = document.getElementById('roles-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-[#0a0f1c]">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden flex items-center">
        {/* Background Elements */}
        <div className="absolute inset-0">
          {/* Main gradient orbs */}
          <div 
            className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 60%)', filter: 'blur(80px)' }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-25"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 60%)', filter: 'blur(80px)' }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 50%)', filter: 'blur(100px)' }}
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

        <div className="relative section-padding max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="order-2 lg:order-1">
              {/* Badge */}
              <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-white/70">About Our Agency</span>
              </div>
              
              {/* Title */}
              <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.1]">
                We Build{' '}
                <span className="relative inline-block">
                  <span className="text-gradient">Digital</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 2 150 2 198 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981"/>
                        <stop offset="100%" stopColor="#6366F1"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>{' '}
                Excellence
              </h1>
              
              {/* Subtitle */}
              <p className="hero-subtitle text-white/60 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                Onneshan is a team of passionate developers, designers, and strategists 
                dedicated to transforming ideas into powerful digital products that drive 
                business growth and innovation.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-10">
                <button 
                  onClick={scrollToRoles}
                  className="hero-cta group inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 text-gray-900 font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105"
                >
                  Meet Our Team
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a 
                  href="/"
                  className="hero-cta group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/5 hover:border-white/30 transition-all"
                >
                  View Our Work
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 lg:gap-8">
                {heroStats.map((stat, index) => (
                  <div key={index} className="hero-stat flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400">
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stat.number}</div>
                      <div className="text-white/40 text-sm">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="hero-visual order-1 lg:order-2 relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Background Glow */}
                <div 
                  className="absolute inset-0 rounded-3xl blur-3xl opacity-40"
                  style={{ 
                    background: 'radial-gradient(circle at 30% 30%, rgba(16,185,129,0.3) 0%, rgba(99,102,241,0.2) 50%, transparent 70%)',
                  }}
                />
                
                {/* Main Card */}
                <div 
                  className="relative h-full rounded-3xl overflow-hidden border backdrop-blur-sm"
                  style={{ 
                    borderColor: 'rgba(255,255,255,0.1)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                  }}
                >
                  {/* Inner Gradient */}
                  <div 
                    className="absolute inset-0 opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, transparent 50%, rgba(99,102,241,0.1) 100%)',
                    }}
                  />

                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-8">
                    {/* Team Icon */}
                    <div className="relative mb-6">
                      <div 
                        className="w-32 h-32 rounded-3xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(99,102,241,0.2) 100%)',
                          boxShadow: '0 0 60px rgba(16,185,129,0.2)',
                          border: '1px solid rgba(16,185,129,0.3)',
                        }}
                      >
                        <Users className="w-16 h-16 text-emerald-400" />
                      </div>
                      {/* Floating Elements */}
                      <div 
                        className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20"
                        style={{ animation: 'float 4s ease-in-out infinite' }}
                      >
                        <Code2 className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div 
                        className="absolute -bottom-4 -left-4 w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/20"
                        style={{ animation: 'float 4s ease-in-out infinite 1s' }}
                      >
                        <Palette className="w-5 h-5 text-pink-400" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 text-center">Expert Team</h3>
                    <p className="text-white/50 text-center text-sm mb-6">
                      Multidisciplinary professionals working together
                    </p>

                    {/* Team Avatars */}
                    <div className="flex items-center justify-center">
                      <div className="flex -space-x-3">
                        {['#10B981', '#6366F1', '#EC4899', '#38BDF8', '#F59E0B'].map((color, i) => (
                          <div 
                            key={i}
                            className="w-10 h-10 rounded-full border-2 border-[#0a0f1c] flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: color }}
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      <div className="ml-4 text-white/50 text-sm">
                        <span className="text-white font-semibold">15+</span> Experts
                      </div>
                    </div>
                  </div>

                  {/* Corner Decorations */}
                  <div className="absolute top-4 left-4 flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-animate relative py-20 lg:py-28">
        <div className="section-padding max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="item-animate inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                <Target className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-white/60">Our Mission</span>
              </div>
              <h2 className="item-animate text-3xl md:text-4xl font-bold text-white mb-6">
                Empowering Businesses Through Technology
              </h2>
              <p className="item-animate text-white/60 text-lg leading-relaxed mb-6">
                Our mission is to bridge the gap between innovative ideas and digital reality. 
                We believe that every business deserves access to world-class technology solutions 
                that drive growth, efficiency, and competitive advantage.
              </p>
              <p className="item-animate text-white/60 text-lg leading-relaxed">
                With over 150+ successful projects and a 99% client satisfaction rate, 
                we've proven that our approach works. We're not just developers – we're 
                your technology partners committed to your long-term success.
              </p>
            </div>
            
            <div className="item-animate grid grid-cols-2 gap-4">
              {[
                { number: '150+', label: 'Projects Delivered' },
                { number: '50+', label: 'Happy Clients' },
                { number: '99%', label: 'Satisfaction Rate' },
                { number: '7+', label: 'Years Experience' },
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center hover:border-emerald-500/30 transition-colors"
                >
                  <div className="text-3xl font-bold text-emerald-400 mb-2">{stat.number}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-animate relative py-20 lg:py-28 bg-[#0B1120]">
        <div className="section-padding max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="item-animate inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-white/60">Our Values</span>
            </div>
            <h2 className="item-animate text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              What Drives Us
            </h2>
            <p className="item-animate text-white/50 max-w-2xl mx-auto">
              Our core values define how we work and what we stand for.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="item-animate group relative p-6 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  border: `1px solid ${value.color}20`,
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${value.color}15`, color: value.color }}
                >
                  {value.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{value.description}</p>
                
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${value.color}10 0%, transparent 70%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Roles Section */}
      <section id="roles-section" className="section-animate relative py-20 lg:py-28">
        <div className="section-padding max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="item-animate inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/60">Our Team Structure</span>
            </div>
            <h2 className="item-animate text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Key Roles & Responsibilities
            </h2>
            <p className="item-animate text-white/50 max-w-3xl mx-auto">
              Our multidisciplinary team brings together diverse expertise to deliver 
              comprehensive solutions. Each role plays a crucial part in our success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyRoles.map((role, index) => (
              <div
                key={index}
                className="item-animate group relative p-6 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  border: `1px solid ${role.color}20`,
                }}
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${role.color}15`, color: role.color }}
                  >
                    {role.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{role.title}</h3>
                    <p className="text-white/50 text-sm mt-1">{role.description}</p>
                  </div>
                </div>

                {/* Responsibilities */}
                <ul className="space-y-2">
                  {role.responsibilities.map((resp, respIndex) => (
                    <li key={respIndex} className="flex items-start gap-2 text-sm text-white/60">
                      <div 
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: role.color }}
                      />
                      {resp}
                    </li>
                  ))}
                </ul>

                {/* Hover Glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${role.color}10 0%, transparent 70%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-animate relative py-20 lg:py-28 bg-[#0B1120]">
        <div className="section-padding max-w-4xl mx-auto text-center">
          <div className="item-animate inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Rocket className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/60">Join Our Journey</span>
          </div>
          <h2 className="item-animate text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Work With Us?
          </h2>
          <p className="item-animate text-white/50 text-lg mb-8 max-w-2xl mx-auto">
            Let's collaborate to bring your vision to life. Our team is ready to 
            tackle your next big project.
          </p>
          <div className="item-animate flex flex-wrap justify-center gap-4">
            <a 
              href="/#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-gray-900 font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105"
            >
              Start a Project
              <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/5 transition-all"
            >
              View Our Work
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
