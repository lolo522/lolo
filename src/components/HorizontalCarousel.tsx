import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalCarouselProps {
  children: React.ReactNode;
}

export function HorizontalCarousel({ children }: HorizontalCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group">
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-2"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-3 sm:gap-4 px-4 sm:px-0 pb-4" style={{ minWidth: 'min-content' }}>
          {children}
        </div>
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:-translate-x-2"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
