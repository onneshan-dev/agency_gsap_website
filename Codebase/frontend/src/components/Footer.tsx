import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Twitter, Linkedin, Github, Instagram, ArrowUp, Heart, MapPin, Mail, Phone } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Footer: React.FC = () => {
  const footerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    // Store local ScrollTriggers
    const localTriggers: ScrollTrigger[] = [];

    // Content animations
    const contentTween = gsap.fromTo(
      footer.querySelectorAll('.animate-item'),
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
    if (contentTween.scrollTrigger) localTriggers.push(contentTween.scrollTrigger);

    return () => {
      localTriggers.forEach((st) => st.kill());
    };
  }, []);

  const scrollToTop = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (href: string) => {
    if (href === '#') return;
    if (href.startsWith('#')) {
      navigate('/' + href);
    } else {
      navigate(href);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      className="relative pt-16 pb-8"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Top Border Gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="section-padding max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="animate-item inline-block text-2xl font-bold text-white hover:text-emerald-400 transition-colors mb-4"
              onClick={() => scrollToTop()}
            >
              ONNESHAN
            </Link>
            <p className="animate-item text-white/50 text-sm mb-6 leading-relaxed">
              We build digital products that help businesses grow and succeed in the modern world.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="mailto:hello@onneshan.com" 
                className="animate-item flex items-center gap-3 text-white/50 hover:text-emerald-400 transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                hello@onneshan.com
              </a>
              <a 
                href="tel:+15551234567" 
                className="animate-item flex items-center gap-3 text-white/50 hover:text-emerald-400 transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </a>
              <div className="animate-item flex items-center gap-3 text-white/50 text-sm">
                <MapPin className="w-4 h-4" />
                San Francisco, CA
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="animate-item text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              {[
                { label: 'Web Development', href: '#services' },
                { label: 'Mobile Apps', href: '#services' },
                { label: 'AI Solutions', href: '#services' },
                { label: 'UI/UX Design', href: '#services' },
                { label: 'Cloud Services', href: '#services' },
              ].map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="animate-item text-white/50 hover:text-emerald-400 transition-colors text-sm inline-block text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="animate-item text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Our Work', href: '#work' },
                { label: 'Process', href: '#process' },
                { label: 'Careers', href: '#' },
                { label: 'Contact', href: '#contact' },
              ].map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="animate-item text-white/50 hover:text-emerald-400 transition-colors text-sm inline-block text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h4 className="animate-item text-white font-semibold mb-4">Connect</h4>
            
            {/* Social Links */}
            <div className="flex gap-3 mb-6">
              {[
                { icon: <Twitter className="w-4 h-4" />, href: '#', label: 'Twitter' },
                { icon: <Linkedin className="w-4 h-4" />, href: '#', label: 'LinkedIn' },
                { icon: <Github className="w-4 h-4" />, href: '#', label: 'GitHub' },
                { icon: <Instagram className="w-4 h-4" />, href: '#', label: 'Instagram' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="animate-item w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:bg-emerald-500 hover:text-gray-900 transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="animate-item group flex items-center gap-2 text-white/50 hover:text-emerald-400 transition-colors text-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                <ArrowUp className="w-4 h-4" />
              </div>
              Back to top
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm flex items-center gap-1">
            © {currentYear} Onneshan. Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in San Francisco
          </p>
          
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
