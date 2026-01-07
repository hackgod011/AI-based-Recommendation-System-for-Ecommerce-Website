import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type HeroSlide = {
  id: number;
  image: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  autoPlayInterval?: number;
};

export default function HeroCarousel({ slides, autoPlayInterval = 5000 }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [slides.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[400px] bg-gray-900 overflow-hidden">
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full h-full relative">
            <img
              src={slide.image}
              alt={slide.title || 'Hero slide'}
              className="w-full h-full object-cover"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Content Overlay */}
            {(slide.title || slide.subtitle) && (
              <div className="absolute bottom-0 left-0 right-0 p-8 max-w-[1500px] mx-auto">
                {slide.title && (
                  <h2 className="text-white text-4xl font-bold mb-2">{slide.title}</h2>
                )}
                {slide.subtitle && (
                  <p className="text-white text-lg mb-4">{slide.subtitle}</p>
                )}
                {slide.ctaText && (
                  <button 
                    className="bg-white text-gray-900 px-6 py-2 rounded-sm font-medium hover:bg-gray-200 transition-colors"
                    onClick={() => slide.ctaLink && console.log('Navigate to:', slide.ctaLink)}
                  >
                    {slide.ctaText}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-sm shadow-lg transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-gray-900" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-sm shadow-lg transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-gray-900" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}