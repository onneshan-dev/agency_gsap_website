import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Zap, Code2, Cpu, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// WebGL-style Particle System
const ParticleSystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    color: string;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const colors = ['#00D4AA', '#6366F1', '#F472B6', '#38BDF8'];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const initParticles = () => {
      particlesRef.current = [];
      const count = Math.min(55, Math.floor(width / 24));
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.5 + 0.3,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const particles = particlesRef.current;
      const len = particles.length;

      for (let i = 0; i < len; i++) {
        const particle = particles[i];

        // Mouse attraction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 40000) { // 200^2 — avoid sqrt
          particle.vx += dx * 0.0001;
          particle.vy += dy * 0.0001;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Boundary wrap
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Draw particle — no shadowBlur (expensive GPU op)
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(particle.alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Draw connections — only check nearby particles
        for (let j = i + 1; j < len; j++) {
          const other = particles[j];
          const odx = particle.x - other.x;
          const ody = particle.y - other.y;
          const odistSq = odx * odx + ody * ody;

          if (odistSq < 10000) { // 100^2 — avoid sqrt
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            const alpha = (1 - Math.sqrt(odistSq) / 100) * 0.12;
            ctx.strokeStyle = `rgba(100, 100, 100, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    animate();

    const handleResize = () => { resize(); initParticles(); };
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

// Animated Grid Background
const AnimatedGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,170,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,170,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center top',
          animation: 'gridMove 20s linear infinite',
        }}
      />
      <style>{`
        @keyframes gridMove {
          0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
          100% { transform: perspective(500px) rotateX(60deg) translateY(60px); }
        }
      `}</style>
    </div>
  );
};

// Floating Orbs with Complex Animation
const FloatingOrb: React.FC<{
  color: string;
  size: number;
  initialX: string;
  initialY: string;
  delay?: number;
}> = ({ color, size, initialX, initialY, delay = 0 }) => {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;

    // Complex floating animation
    gsap.to(orb, {
      y: '+=30',
      x: '+=15',
      duration: 4 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: delay,
    });

    gsap.to(orb, {
      scale: 1.1,
      duration: 3 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: delay + 0.5,
    });
  }, [delay]);

  return (
    <div
      ref={orbRef}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: initialX,
        top: initialY,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(60px)',
        opacity: 0.4,
      }}
    />
  );
};

// Magnetic Button Component
const MagneticButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}> = ({ children, className = '', onClick, variant = 'primary' }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const button = buttonRef.current;
    const text = textRef.current;
    if (!button || !text) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(button, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: 'power2.out',
    });

    gsap.to(text, {
      x: x * 0.1,
      y: y * 0.1,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const button = buttonRef.current;
    const text = textRef.current;
    if (!button || !text) return;

    gsap.to([button, text], {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    });
  }, []);

  const baseStyles = 'relative px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden';
  const variantStyles = {
    primary: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-gray-900 hover:shadow-[0_0_40px_rgba(0,212,170,0.4)]',
    secondary: 'border border-white/20 text-white hover:border-emerald-400/50 hover:bg-white/5 backdrop-blur-sm',
  };

  return (
    <button
      ref={buttonRef}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <span ref={textRef} className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
};

const HeroLanding: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const tagline = taglineRef.current;
    const badge = badgeRef.current;
    const stats = statsRef.current;
    const buttons = buttonsRef.current;

    if (!section || !headline || !tagline || !badge || !stats || !buttons) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set([headline, tagline, badge, stats], { opacity: 1 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.5 });

    // Badge animation
    tl.fromTo(
      badge,
      { y: 20, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );

    // Headline character animation
    const headlineText = headline.textContent || '';
    headline.innerHTML = headlineText
      .split('')
      .map((char) => 
        `<span class="inline-block" style="display: ${char === ' ' ? 'inline' : 'inline-block'}">${char === ' ' ? '&nbsp;' : char}</span>`
      )
      .join('');

    const chars = headline.querySelectorAll('span');

    tl.fromTo(
      chars,
      {
        y: 120,
        rotateX: -90,
        opacity: 0,
        transformOrigin: 'center bottom',
      },
      {
        y: 0,
        rotateX: 0,
        opacity: 1,
        duration: 0.8,
        stagger: {
          each: 0.04,
          from: 'start',
        },
        ease: 'back.out(1.4)',
      },
      '-=0.3'
    );

    // Tagline reveal
    tl.fromTo(
      tagline,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.4'
    );

    // Stats counter animation
    const statNumbers = stats.querySelectorAll('.stat-number');
    statNumbers.forEach((stat) => {
      const target = stat.getAttribute('data-value') || '0';
      const obj = { value: 0 };
      const numericTarget = parseInt(target.replace(/\D/g, ''));
      
      tl.to(obj, {
        value: numericTarget,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          stat.textContent = Math.round(obj.value) + target.replace(/\d/g, '');
        },
      }, '-=0.6');
    });

    // Scroll exit animation — short pin, exits immediately on scroll
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=55%',
        pin: true,
        scrub: 0.6,
      },
    });

    // All elements exit together starting from scroll position 0
    scrollTl
      .fromTo(badge,
        { y: 0, opacity: 1 },
        { y: -40, opacity: 0, ease: 'power2.in' },
        0
      )
      .fromTo(headline,
        { y: 0, opacity: 1, scale: 1 },
        { y: -80, opacity: 0, scale: 0.92, ease: 'power2.in' },
        0
      )
      .fromTo(tagline,
        { y: 0, opacity: 1 },
        { y: -60, opacity: 0, ease: 'power2.in' },
        0
      )
      .fromTo(buttons,
        { y: 0, opacity: 1 },
        { y: -50, opacity: 0, ease: 'power2.in' },
        0
      )
      .fromTo(stats,
        { y: 0, opacity: 1 },
        { y: -30, opacity: 0, ease: 'power2.in' },
        0
      );

    return () => {
      scrollTl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === section) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden pt-20"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Particle System */}
      <ParticleSystem />

      {/* Animated Grid */}
      <AnimatedGrid />

      {/* Floating Orbs */}
      <FloatingOrb color="#00D4AA" size={500} initialX="10%" initialY="20%" delay={0} />
      <FloatingOrb color="#6366F1" size={400} initialX="70%" initialY="60%" delay={0.5} />
      <FloatingOrb color="#F472B6" size={350} initialX="80%" initialY="15%" delay={1} />
      <FloatingOrb color="#38BDF8" size={300} initialX="20%" initialY="70%" delay={1.5} />

      {/* Floating Tech Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[Code2, Cpu, Sparkles, Zap].map((Icon, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${15 + i * 25}%`,
              top: `${20 + (i % 2) * 50}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i}s`,
            }}
          >
            <Icon className="w-8 h-8 text-white/10" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center section-padding max-w-5xl mx-auto flex flex-col justify-center h-full py-4">
        {/* Badge */}
        <div
          ref={badgeRef}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md w-fit mx-auto"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-sm text-white/70 whitespace-nowrap">Available for new projects</span>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-tight"
          style={{ perspective: '1000px' }}
        >
          ONNESHAN
        </h1>

        {/* Tagline */}
        <p
          ref={taglineRef}
          className="text-lg sm:text-xl md:text-2xl text-white/60 font-light mb-8 max-w-2xl mx-auto"
        >
          We craft <span className="text-emerald-400 font-medium">digital experiences</span> that 
          define the future of web, mobile, and AI.
        </p>

        {/* CTA Buttons */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <MagneticButton
            variant="primary"
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Our Work
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>

          <MagneticButton
            variant="secondary"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get in Touch
          </MagneticButton>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="flex items-center justify-center gap-6 md:gap-12">
          {[
            { value: '150', suffix: '+', label: 'Projects Delivered' },
            { value: '50', suffix: '+', label: 'Happy Clients' },
            { value: '99', suffix: '%', label: 'Success Rate' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div 
                className="stat-number text-2xl md:text-3xl font-bold text-white"
                data-value={stat.value + stat.suffix}
              >
                0{stat.suffix}
              </div>
              <div className="text-[10px] text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-white/30 uppercase tracking-widest">Scroll</span>
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce" />
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0B1120] to-transparent" />
    </section>
  );
};

export default HeroLanding;
