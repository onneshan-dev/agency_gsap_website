import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, Users, Award, Headphones } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const stats: Stat[] = [
  { 
    value: 150, 
    suffix: '+', 
    label: 'Projects Delivered',
    icon: <TrendingUp className="w-5 h-5" />,
    color: '#10B981',
  },
  { 
    value: 50, 
    suffix: '+', 
    label: 'Clients Worldwide',
    icon: <Users className="w-5 h-5" />,
    color: '#6366F1',
  },
  { 
    value: 99, 
    suffix: '%', 
    label: 'Satisfaction Rate',
    icon: <Award className="w-5 h-5" />,
    color: '#EC4899',
  },
  { 
    value: 24, 
    suffix: '/7', 
    label: 'Support Available',
    icon: <Headphones className="w-5 h-5" />,
    color: '#38BDF8',
  },
];

const StatsCounter: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Store local ScrollTriggers
    const localTriggers: ScrollTrigger[] = [];

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Header animation
    const headerTween = gsap.fromTo(
      section.querySelectorAll('.animate-item'),
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );
    if (headerTween.scrollTrigger) localTriggers.push(headerTween.scrollTrigger);

    if (prefersReducedMotion) {
      statsRef.current.forEach((stat, index) => {
        if (!stat) return;
        const numberEl = stat.querySelector('.stat-number');
        if (numberEl) {
          numberEl.textContent = stats[index].value + stats[index].suffix;
        }
      });
      return () => {
        localTriggers.forEach((st) => st.kill());
      };
    }

    // Stats animation trigger
    const statsTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      onEnter: () => {
        if (hasAnimated) return;
        setHasAnimated(true);

        statsRef.current.forEach((stat, index) => {
          if (!stat) return;

          const numberEl = stat.querySelector('.stat-number');
          const iconEl = stat.querySelector('.stat-icon');
          const labelEl = stat.querySelector('.stat-label');

          if (!numberEl) return;

          const targetValue = stats[index].value;
          const obj = { value: 0 };

          // Card entrance
          gsap.fromTo(
            stat,
            { y: 40, opacity: 0, scale: 0.95 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.6,
              delay: index * 0.1,
              ease: 'power3.out',
            }
          );

          // Number count-up
          gsap.to(obj, {
            value: targetValue,
            duration: 2,
            ease: 'power2.out',
            delay: index * 0.1 + 0.2,
            onUpdate: () => {
              numberEl.textContent = Math.round(obj.value) + stats[index].suffix;
            },
            onComplete: () => {
              gsap.fromTo(
                numberEl,
                { scale: 1.1 },
                { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
              );
            },
          });

          // Icon animation
          if (iconEl) {
            gsap.fromTo(
              iconEl,
              { scale: 0, rotation: -180 },
              {
                scale: 1,
                rotation: 0,
                duration: 0.5,
                delay: index * 0.1 + 0.3,
                ease: 'back.out(2)',
              }
            );
          }

          // Label fade in
          if (labelEl) {
            gsap.fromTo(
              labelEl,
              { y: 10, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.4, delay: index * 0.1 + 0.5 }
            );
          }
        });
      },
    });
    localTriggers.push(statsTrigger);

    return () => {
      // Only kill this section's ScrollTriggers
      localTriggers.forEach((st) => st.kill());
    };
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-24 overflow-hidden"
      style={{ backgroundColor: '#0a0f1c' }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(0,212,170,0.15) 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
      </div>

      <div className="relative section-padding max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="animate-item inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/60">Our Impact</span>
          </div>
          <h2 className="animate-item text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Numbers That <span className="text-gradient">Speak</span>
          </h2>
          <p className="animate-item text-white/50 max-w-2xl mx-auto">
            We've helped businesses achieve remarkable results through innovative digital solutions.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              ref={(el) => { statsRef.current[index] = el; }}
              className="relative group rounded-2xl p-6 text-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: `1px solid ${stat.color}20`,
              }}
            >
              {/* Icon */}
              <div 
                className="stat-icon w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ 
                  backgroundColor: `${stat.color}15`,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>

              {/* Number */}
              <div 
                className="stat-number text-4xl lg:text-5xl font-bold text-white tabular-nums mb-2"
              >
                0{stat.suffix}
              </div>

              {/* Label */}
              <div className="stat-label text-white/50 text-sm">
                {stat.label}
              </div>

              {/* Hover Glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${stat.color}10 0%, transparent 70%)`,
                }}
              />

              {/* Corner Accent */}
              <div 
                className="absolute top-0 right-0 w-16 h-16 opacity-20"
                style={{
                  background: `linear-gradient(135deg, ${stat.color}40 0%, transparent 50%)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/40 text-sm mb-4">Ready to add your project to our success stories?</p>
          <a 
            href="#contact" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-gray-900 font-semibold hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105"
          >
            Start Your Project
          </a>
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
