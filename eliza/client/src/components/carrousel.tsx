"use client";

import { useEffect, useState, useRef } from "react";

// Import all logos
import ai16z from "../assets/logos-ext/ai16z.svg";
import coingecko from "../assets/logos-ext/coingecko.svg";
import defillama from "../assets/logos-ext/defillama.svg";


const logos = [
  { id: "defillama", src: defillama, alt: "DefiLlama" },
  { id: "ai16z", src: ai16z, alt: "AI16Z" },
  { id: "coingecko", src: coingecko, alt: "Coingecko" },
];

export function LogoCarousel() {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const scrollContainer = containerRef.current;
    const totalWidth = scrollContainer.scrollWidth / 2;
    let animationFrameId: number;

    const scroll = () => {
      if (!isHovered) {
        scrollPositionRef.current += 0.5;
        if (scrollPositionRef.current >= totalWidth) {
          scrollPositionRef.current = 0;
        }
        scrollContainer.style.transform = `translateX(-${scrollPositionRef.current}px)`;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    scroll();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isHovered]);

  return (
    <div className="w-full overflow-hidden bg-background/80 backdrop-blur-sm border-y border-white/[0.08] py-12">
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={containerRef}
          className="flex space-x-12 whitespace-nowrap"
          style={{
            willChange: 'transform',
          }}
        >
          {/* First set of logos */}
          {logos.map((logo) => (
            <div
              key={`first-${logo.id}`}
              className="inline-block w-32 h-16 flex-shrink-0"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="w-full h-full object-contain filter brightness-75 hover:brightness-100 transition-all duration-300"
                title={logo.alt}
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {logos.map((logo) => (
            <div
              key={`second-${logo.id}`}
              className="inline-block w-32 h-16 flex-shrink-0"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="w-full h-full object-contain filter brightness-75 hover:brightness-100 transition-all duration-300"
                title={logo.alt}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
