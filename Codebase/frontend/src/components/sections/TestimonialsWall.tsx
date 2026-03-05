import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Quote, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    quote: 'ONNESHAN transformed our digital presence completely. Their attention to detail and technical expertise exceeded all expectations.',
    author: 'Sarah Chen',
    role: 'CTO',
    company: 'TechVentures Inc.',
    avatar: 'SC',
    color: '#10B981',
  },
  {
    id: '2',
    quote: 'Working with this team was a game-changer for our startup. They delivered a world-class product in record time.',
    author: 'Michael Roberts',
    role: 'Founder & CEO',
    company: 'InnovateLabs',
    avatar: 'MR',
    color: '#6366F1',
  },
  {
    id: '3',
    quote: 'The AI automation solution they built increased our operational efficiency by 300%. Truly exceptional work.',
    author: 'Emily Watson',
    role: 'Operations Director',
    company: 'DataFlow Systems',
    avatar: 'EW',
    color: '#EC4899',
  },
  {
    id: '4',
    quote: 'Professional, creative, and incredibly skilled. Our mobile app has received rave reviews from users.',
    author: 'David Park',
    role: 'Product Manager',
    company: 'AppWorks Co.',
    avatar: 'DP',
    color: '#38BDF8',
  },
];

const TestimonialsWall: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Store local ScrollTriggers
    const localTriggers: ScrollTrigger[] = [];

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

    // Cards animation
    const cardsTween = gsap.fromTo(
      section.querySelectorAll('.testimonial-card'),
      { y: 60, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      }
    );
    if (cardsTween.scrollTrigger) localTriggers.push(cardsTween.scrollTrigger);

    return () => {
      // Only kill this section's ScrollTriggers
      localTriggers.forEach((st) => st.kill());
    };
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ backgroundColor: '#0B1120' }}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, ${activeTestimonial.color}08 0%, transparent 50%)`,
        }}
      />

      <div className="relative section-padding max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <div className="animate-item inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white/60">Testimonials</span>
            </div>
            <h2 className="animate-item text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              What Clients <span className="text-gradient">Say</span>
            </h2>
            <p className="animate-item text-white/50 mt-3 max-w-lg">
              Hear from the people we've worked with.
            </p>
          </div>

          {/* Navigation */}
          <div className="animate-item flex items-center gap-3">
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
              }}
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          <div className="flex gap-2 px-2">
            {testimonials.map((t, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setActiveIndex(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex ? 'w-8' : 'w-2 bg-white/20 hover:bg-white/30'
                  }`}
                  style={{ backgroundColor: i === activeIndex ? t.color : undefined }}
                />
              ))}
            </div>
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                setActiveIndex((prev) => (prev + 1) % testimonials.length);
              }}
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Testimonial */}
        <div className="mb-8">
          <div 
            className="testimonial-card relative rounded-3xl p-8 lg:p-10 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${activeTestimonial.color}10 0%, rgba(255,255,255,0.02) 100%)`,
              border: `1px solid ${activeTestimonial.color}30`,
            }}
          >
            <Quote 
              className="absolute top-6 right-6 w-16 h-16 opacity-10"
              style={{ color: activeTestimonial.color }}
            />

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            {/* Quote */}
            <p className="text-white/90 text-xl lg:text-2xl leading-relaxed mb-8 max-w-3xl">
              "{activeTestimonial.quote}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{
                  background: `linear-gradient(135deg, ${activeTestimonial.color} 0%, ${activeTestimonial.color}80 100%)`,
                }}
              >
                {activeTestimonial.avatar}
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{activeTestimonial.author}</p>
                <p className="text-white/50">
                  {activeTestimonial.role}, {activeTestimonial.company}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Other Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.filter((_, i) => i !== activeIndex).map((testimonial) => (
            <button
              key={testimonial.id}
              onClick={() => {
                setIsAutoPlaying(false);
                setActiveIndex(testimonials.findIndex(t => t.id === testimonial.id));
              }}
              className="testimonial-card text-left rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: `1px solid ${testimonial.color}20`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{
                    background: `linear-gradient(135deg, ${testimonial.color} 0%, ${testimonial.color}80 100%)`,
                  }}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{testimonial.author}</p>
                  <p className="text-white/40 text-xs">{testimonial.company}</p>
                </div>
              </div>
              <p className="text-white/60 text-sm line-clamp-2">
                "{testimonial.quote}"
              </p>
            </button>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-white/30 text-sm mb-4">Trusted by innovative companies</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].map((company, i) => (
              <span key={i} className="text-lg font-bold text-white/30">{company}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsWall;
