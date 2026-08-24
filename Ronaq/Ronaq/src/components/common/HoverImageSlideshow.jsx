import React, { useState, useEffect, useMemo } from 'react';

export const HoverImageSlideshow = ({
  images = [],
  primaryImage = '',
  alt = 'Product image',
  className = '',
  containerClassName = '',
  aspectRatio = 'aspect-[4/5]',
  showDots = true,
  intervalMs = 1100,
  children,
  onClick
}) => {
  // Extract all valid image URLs into a flat array
  const imageList = useMemo(() => {
    const list = [];
    if (primaryImage) list.push(primaryImage);

    if (Array.isArray(images)) {
      images.forEach(img => {
        const url = typeof img === 'string' ? img : (img?.image_url || img?.image || '');
        if (url && !list.includes(url)) {
          list.push(url);
        }
      });
    }

    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'];
  }, [images, primaryImage]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [angleStep, setAngleStep] = useState(0); // 0: standard, 1: zoom-top (dropper/cap), 2: zoom-center (detail)

  // Automatic slideshow cycle on hover
  useEffect(() => {
    if (!isHovered) return;

    const timer = setInterval(() => {
      if (imageList.length > 1) {
        setCurrentIndex(prev => (prev + 1) % imageList.length);
      } else {
        // Multi-angle perspective shift for single-image products
        setAngleStep(prev => (prev + 1) % 3);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isHovered, imageList.length, intervalMs]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (imageList.length > 1) {
      setCurrentIndex(1 % imageList.length);
    } else {
      setAngleStep(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentIndex(0);
    setAngleStep(0);
  };

  // Dynamic transform styles for single image angle shifts
  const getSingleImageTransform = () => {
    if (imageList.length > 1) {
      return isHovered ? 'scale-105' : 'scale-100';
    }
    if (!isHovered) return 'scale-100 translate-y-0';
    if (angleStep === 1) return 'scale-125 -translate-y-4 origin-top transition-transform duration-700'; // Top angle / Dropper / Collar zoom
    if (angleStep === 2) return 'scale-120 translate-y-2 origin-center transition-transform duration-700'; // Detail body angle
    return 'scale-105 translate-y-0 transition-transform duration-500';
  };

  const totalViews = imageList.length > 1 ? imageList.length : 3;
  const activeViewNumber = imageList.length > 1 ? currentIndex + 1 : angleStep + 1;

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 ${aspectRatio} ${containerClassName} cursor-pointer group/slideshow`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Active Angle Image */}
      <img
        key={imageList[currentIndex]}
        src={imageList[currentIndex]}
        alt={`${alt} (Angle View ${activeViewNumber} of ${totalViews})`}
        className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${getSingleImageTransform()} ${className}`}
        loading="lazy"
      />

      {/* Subtle Angle Perspective Tag on Hover */}
      {isHovered && (
        <div className="absolute top-3 right-3 z-20 pointer-events-none animate-fade-in">
          <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-amber-300 font-extrabold text-[9px] tracking-wider uppercase backdrop-blur-md border border-amber-500/20 shadow-md">
            Angle {activeViewNumber}/{totalViews}
          </span>
        </div>
      )}

      {/* Micro-Pagination Progress Dots on Hover */}
      {showDots && isHovered && (
        <div className="absolute bottom-2.5 left-0 right-0 z-20 flex items-center justify-center gap-1.5 px-3 pointer-events-none animate-fade-in">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 shadow-sm">
            {[...Array(totalViews)].map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  (activeViewNumber - 1) === idx
                    ? 'w-3.5 bg-amber-400'
                    : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Child Elements (e.g. Badges, Wishlist, Quick view overlay) */}
      {children}
    </div>
  );
};

