import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Sparkles, Zap, Send, Calendar, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CTASection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [emailText, setEmailText] = useState('');
  const fullEmail = 'hello@onneshan.com';

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    // Store local ScrollTriggers
    const localTriggers: ScrollTrigger[] = [];

    // Content entrance animation
    const contentTween = gsap.fromTo(
      content.querySelectorAll('.animate-item'),
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      }
    );
    if (contentTween.scrollTrigger) localTriggers.push(contentTween.scrollTrigger);

    // Typewriter effect for email
    const emailTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      onEnter: () => {
        let i = 0;
        const interval = setInterval(() => {
          if (i <= fullEmail.length) {
            setEmailText(fullEmail.slice(0, i));
            i++;
          } else {
            clearInterval(interval);
          }
        }, 50);
      },
      once: true,
    });
    localTriggers.push(emailTrigger);

    return () => {
      // Only kill this section's ScrollTriggers
      localTriggers.forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', filter: 'blur(80px)' }}
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

      <div ref={contentRef} className="relative section-padding max-w-5xl mx-auto">
        {/* Main Card */}
        <div className="relative rounded-3xl overflow-hidden">
          {/* Card Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
          <div className="absolute inset-0 backdrop-blur-xl" />
          
          {/* Border */}
          <div className="absolute inset-0 rounded-3xl p-[1px]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/50 via-indigo-500/50 to-pink-500/50" />
            <div className="absolute inset-[1px] rounded-3xl bg-[#0a0a0a]/95" />
          </div>

          <div className="relative px-6 py-12 lg:px-16 lg:py-16 text-center">
            {/* Badge */}
            <div className="animate-item inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-sm text-white/70">Available for new projects</span>
            </div>

            {/* Heading */}
            <h2 className="animate-item text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Build Something{' '}
              <span className="text-gradient">Extraordinary?</span>
            </h2>

            <p className="animate-item text-white/50 text-base md:text-lg max-w-2xl mx-auto mb-8">
              Let's discuss your project and turn your vision into reality. 
              We're here to help you create something amazing.
            </p>

            {/* CTA Buttons */}
            <div className="animate-item flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button className="group relative w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 text-gray-900 font-semibold overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 flex items-center justify-center gap-2">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <Calendar className="w-5 h-5 relative" />
                <span className="relative">Book a Free Call</span>
                <ArrowUpRight className="w-4 h-4 relative group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>

              <button className="group w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-white border border-white/20 hover:border-emerald-400/50 hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                <span>Send a Message</span>
              </button>
            </div>

            {/* Divider */}
            <div className="animate-item flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
              <span className="text-white/30 text-sm">or</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
            </div>

            {/* Email */}
            <div className="animate-item inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-base md:text-lg font-mono text-white/70 group-hover:text-emerald-400 transition-colors">
                {emailText}
                <span className="inline-block w-0.5 h-5 bg-emerald-400 ml-1 animate-pulse" />
              </span>
            </div>

            {/* Response Time */}
            <div className="animate-item mt-6 flex items-center justify-center gap-2 text-white/40 text-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Average response time: under 2 hours</span>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-4 right-10 hidden lg:block">
          <div className="animate-float p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
