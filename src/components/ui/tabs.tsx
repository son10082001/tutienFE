'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TabsDashBgProps {
  activeTab: string;
  options: {
    label: string | React.ReactNode;
    value: string;
    icon?: React.ReactNode;
  }[];
  onTabChange: (value: string) => void;
  layoutId: string;
  blur?: boolean;
}

const TabsDashBg = ({ activeTab, options, onTabChange, layoutId, blur }: TabsDashBgProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll state
  const checkScrollState = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollState();
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollState);
      window.addEventListener('resize', checkScrollState);

      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollState);
        window.removeEventListener('resize', checkScrollState);
      };
    }
  }, []);

  return (
    <div
      className={cn(
        'no-scrollbar relative flex h-11 w-fit gap-1 rounded-md bg-neutral-50 p-1',
        blur && 'bg-white backdrop-blur-[9px]'
      )}
    >
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className='absolute top-0 left-0 z-20 flex h-full w-8 items-center justify-center rounded-l-md bg-gradient-to-r from-bgc-gray-50 to-transparent transition-all duration-200 hover:scale-105 hover:from-gray-100'
          style={{
            background: blur ? 'linear-gradient(to right, rgba(255, 255, 255, 0.2), transparent)' : undefined,
          }}
          onMouseEnter={scrollLeft}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-colors duration-200',
              blur ? 'text-white hover:text-white/80' : 'text-gray-500 hover:text-black'
            )}
          />
        </button>
      )}

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className='absolute top-0 right-0 z-20 flex h-full w-8 items-center justify-center rounded-r-md bg-gradient-to-l from-gray-50 to-transparent transition-all duration-200 hover:scale-105 hover:from-gray-100'
          style={{
            background: blur ? 'linear-gradient(to left, rgba(255, 255, 255, 0.2), transparent)' : undefined,
          }}
          onMouseEnter={scrollRight}
        >
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-colors duration-200',
              blur ? 'text-white hover:text-white/80' : 'text-gray-500 hover:text-black'
            )}
          />
        </button>
      )}

      {/* Animated background */}
      <div
        className='no-scrollbar relative flex w-full gap-2 overflow-x-auto overflow-y-hidden'
        ref={scrollContainerRef}
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            onClick={() => onTabChange(option.value)}
            data-value={option.value}
            className={cn(
              'typo-label-small relative z-10 flex flex-1 cursor-pointer items-center justify-center gap-[6px] text-nowrap rounded-sm px-4 py-3 font-medium text-xs transition-colors duration-200',
              activeTab === option.value ? 'bg-white text-black' : 'text-gray-300 hover:text-black',
              blur && activeTab !== option.value && 'hover:text-white'
            )}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabsDashBg;
