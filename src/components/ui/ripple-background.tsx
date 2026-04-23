'use client';

import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import React, { useEffect, useRef } from 'react';

interface RippleBackgroundProps {
  image: string;
  intensity?: number;
  rippleSize?: number;
  rippleCount?: number;
  rippleInterval?: number;
  children?: React.ReactNode;
  className?: string;
}

declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

const loadRippleScript = (callback: () => void) => {
  if (typeof window === 'undefined') return;

  if (!window.$) {
    const jq = document.createElement('script');
    jq.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
    jq.async = true;
    jq.onload = () => {
      const rp = document.createElement('script');
      rp.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery.ripples/0.5.3/jquery.ripples.min.js';
      rp.async = true;
      rp.onload = callback;
      document.body.appendChild(rp);
    };
    document.body.appendChild(jq);
  } else if (!window.$.fn?.ripples) {
    const rp = document.createElement('script');
    rp.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery.ripples/0.5.3/jquery.ripples.min.js';
    rp.async = true;
    rp.onload = callback;
    document.body.appendChild(rp);
  } else {
    callback();
  }
};

const supportsRippleWebGL = () => {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  const gl =
    (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
    (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

  if (!gl) return false;

  // jquery.ripples requires floating point texture support.
  return !!gl.getExtension('OES_texture_float');
};

const RippleBackground: React.FC<RippleBackgroundProps> = ({
  image,
  intensity = 3,
  rippleSize = 30,
  rippleCount = 2,
  rippleInterval = 4000,
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!supportsRippleWebGL()) return;

    let active = true;
    let observer: IntersectionObserver | null = null;

    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const startInterval = () => {
      stopInterval();
      intervalRef.current = setInterval(() => {
        if (!containerRef.current || !window.$?.fn?.ripples) return;
        const $el = window.$(containerRef.current);
        const width = $el.outerWidth();
        const height = $el.outerHeight();

        for (let i = 0; i < rippleCount; i++) {
          $el.ripples('drop', Math.random() * width, Math.random() * height, rippleSize, 0.02 + Math.random() * 0.02);
        }
      }, rippleInterval);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopInterval();
      } else {
        startInterval();
      }
    };

    loadRippleScript(() => {
      if (!active || !containerRef.current) return;
      if (!window.$ || typeof window.$.fn?.ripples !== 'function') {
        console.error('Ripples.js failed to load.');
        return;
      }

      const $el = window.$(containerRef.current);
      try {
        $el.ripples('destroy');
      } catch (e) {}

      try {
        $el.ripples({
          resolution: 512,
          dropRadius: rippleSize,
          perturbance: 0.01 + (intensity / 100) * 0.05,
          interactive: true,
        });
      } catch (error) {
        console.warn('Ripples effect is disabled: WebGL float textures are unsupported.', error);
        return;
      }

      if (!document.hidden) startInterval();
      document.addEventListener('visibilitychange', handleVisibility);

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!document.hidden) startInterval();
          } else {
            stopInterval();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
    });

    return () => {
      active = false;
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibility);
      observer?.disconnect();
      if (containerRef.current && window.$?.fn?.ripples) {
        try {
          window.$(containerRef.current).ripples('destroy');
        } catch (e) {}
      }
    };
  }, [image, intensity, rippleCount, rippleInterval, rippleSize]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <div className='pointer-events-none absolute inset-0 z-0' />
      <div className='relative z-10 h-full w-full flex items-center justify-center'>{children}</div>
    </div>
  );
};

export default RippleBackground;
