import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import MagneticButton from './ui/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { label: 'Services', href: '#services', type: 'section' as const },
  { label: 'Process', href: '#process', type: 'section' as const },
  { label: 'Work', href: '#work', type: 'section' as const },
  { label: 'About', href: '/about', type: 'page' as const },
] as const;

type NavLink = (typeof NAV_LINKS)[number];

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const navLinks = NAV_LINKS;

  // Entrance animations
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const logo = nav.querySelector('.nav-logo');
    const links = nav.querySelectorAll('.nav-link');
    const cta = nav.querySelector('.nav-cta');
    const badge = nav.querySelector('.nav-badge');

    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(
      badge,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    )
      .fromTo(
        logo,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(
        links,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(
        cta,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
        '-=0.3'
      );

    return () => {
      tl.kill();
    };
  }, []);

  // Scroll handler for navbar styling and active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
    };

    // Active section detection (only on home page)
    let observer: IntersectionObserver | null = null;
    
    if (isHomePage) {
      const observerOptions = {
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      };

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      }, observerOptions);

      navLinks.forEach((link) => {
        if (link.type === 'section') {
          const section = document.querySelector(link.href);
          if (section) observer?.observe(section);
        }
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer?.disconnect();
    };
  // navLinks is a stable constant defined at module scope.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHomePage]);

  // Mobile menu animation
  useEffect(() => {
    if (!mobileMenuRef.current) return;

    if (isMobileMenuOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }
      );
      gsap.fromTo(
        mobileMenuRef.current.querySelectorAll('.mobile-link'),
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.05, delay: 0.1, ease: 'power3.out' }
      );
    }
  }, [isMobileMenuOpen]);

  const handleNavigation = (link: NavLink) => {
    setIsMobileMenuOpen(false);
    
    if (link.type === 'page') {
      // Navigate to page
      navigate(link.href);
    } else if (isHomePage) {
      // Scroll to section on home page
      const element = document.querySelector(link.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page with section hash
      navigate('/' + link.href);
    }
  };

  const scrollToTop = () => {
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToContact = () => {
    setIsMobileMenuOpen(false);
    if (isHomePage) {
      const element = document.querySelector('#contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#contact');
    }
  };

  const isLinkActive = (link: NavLink) => {
    if (link.type === 'page') {
      return location.pathname === link.href;
    }
    return activeSection === link.href;
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3'
            : 'py-5'
        } ${className}`}
      >
        {/* Background with glassmorphism */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isScrolled
              ? 'bg-onneshan-bg-primary/80 backdrop-blur-xl border-b border-white/5'
              : 'bg-transparent'
          }`}
        />

        {/* Gradient glow on scroll */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 212, 170, 0.08) 0%, transparent 70%)',
          }}
        />

        <div className="w-full section-padding relative">
          <div className="flex items-center justify-between">
            {/* Logo with badge */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="nav-logo group flex items-center gap-3"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTop();
                }}
              >
                {/* Logo Icon */}
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-onneshan-accent-primary to-onneshan-accent-secondary rounded-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="absolute inset-0 border border-onneshan-accent-primary/30 rounded-xl" />
                  <img 
                    src="/logo.png" 
                    alt="Onneshan" 
                    className="relative w-8 h-8 object-contain rounded-lg"
                  />
                  {/* Animated corner accents */}
                  <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-onneshan-accent-primary rounded-tl-md" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-onneshan-accent-primary rounded-br-md" />
                </div>

                {/* Logo Text */}
                <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
                  ONNESHAN
                </span>
              </Link>

              {/* Status Badge */}
              <div className="nav-badge hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-onneshan-accent-primary animate-pulse" />
                <span className="text-[10px] font-medium text-onneshan-text-secondary uppercase tracking-wider">
                  Available
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-white/[0.02] border border-white/5">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    className={`nav-link relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl ${
                      isLinkActive(link)
                        ? 'text-white'
                        : 'text-onneshan-text-secondary hover:text-white'
                    }`}
                    onClick={() => handleNavigation(link)}
                  >
                    {/* Active indicator */}
                    {isLinkActive(link) && (
                      <span className="absolute inset-0 bg-white/10 rounded-xl border border-white/10" />
                    )}
                    <span className="relative">{link.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="nav-cta hidden md:block">
              <MagneticButton
                className="group relative px-5 py-2.5 bg-onneshan-accent-primary text-onneshan-bg-primary text-sm font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-glow-primary"
                strength={0.3}
                onClick={scrollToContact}
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  Get Started
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </MagneticButton>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden relative p-2 text-white rounded-xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <Menu
                  size={24}
                  className={`absolute inset-0 transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                  }`}
                />
                <X
                  size={24}
                  className={`absolute inset-0 transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div
              ref={mobileMenuRef}
              className="md:hidden absolute top-full left-4 right-4 mt-2 py-4 px-4 rounded-2xl bg-onneshan-bg-primary/95 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    className={`mobile-link flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      isLinkActive(link)
                        ? 'bg-white/10 text-white'
                        : 'text-onneshan-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => handleNavigation(link)}
                  >
                    {link.label}
                    {isLinkActive(link) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-onneshan-accent-primary" />
                    )}
                  </button>
                ))}
                <div className="mobile-link mt-3 pt-3 border-t border-white/10">
                  <button
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-onneshan-accent-primary text-onneshan-bg-primary text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-glow-primary"
                    onClick={scrollToContact}
                  >
                    Get Started
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
