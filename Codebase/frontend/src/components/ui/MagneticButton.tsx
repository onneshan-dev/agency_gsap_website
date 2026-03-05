import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  strength = 0.4,
  onClick,
  variant = 'primary',
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const boundingRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const inner = innerRef.current;
    if (!button || !inner) return;

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const handleMouseEnter = () => {
      boundingRef.current = button.getBoundingClientRect();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!boundingRef.current) return;

      const { left, top, width, height } = boundingRef.current;
      const x = e.clientX - left - width / 2;
      const y = e.clientY - top - height / 2;

      gsap.to(button, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out',
      });

      gsap.to(inner, {
        x: x * strength * 0.3,
        y: y * strength * 0.3,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });

      gsap.to(inner, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  const baseStyles = 'relative inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 overflow-hidden';
  
  const variantStyles = {
    primary: 'bg-onneshan-accent-primary text-onneshan-bg-primary hover:shadow-glow-primary',
    secondary: 'bg-transparent border border-white/20 text-white hover:border-onneshan-accent-primary hover:text-onneshan-accent-primary',
    outline: 'bg-transparent border border-onneshan-accent-primary text-onneshan-accent-primary hover:bg-onneshan-accent-primary hover:text-onneshan-bg-primary',
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      <span ref={innerRef} className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default MagneticButton;
