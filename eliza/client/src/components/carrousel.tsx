"use client";

import { useEffect, useState, useRef } from "react";

// Import all logos
import ai16z from "../assets/logos-ext/ai16z.svg";
import coingecko from "../assets/logos-ext/coingecko.svg";
import defillama from "../assets/logos-ext/defillama.svg";
import discord from "../assets/logos-ext/discord.svg";
import telegram from "../assets/logos-ext/telegram.svg";
import merchantmoe from "../assets/logos-ext/Merchant Moe.svg";
import initcapital from "../assets/logos-ext/initcapital.svg";
import mantlenetwork from "../assets/logos-ext/mantlenetwork.svg";
import methprotocol from "../assets/logos-ext/methprotocol.svg";
import ondo from "../assets/logos-ext/ondo.svg";
import pendle from "../assets/logos-ext/pendle.svg";
import stargate from "../assets/logos-ext/stargate.svg";
import treehouse from "../assets/logos-ext/treehouse.svg";

const logos = [
  { id: "defillama", src: defillama, alt: "DefiLlama" },
  { id: "ai16z", src: ai16z, alt: "AI16Z" },
  { id: "coingecko", src: coingecko, alt: "CoinGecko" },
  { id: "merchantmoe", src: merchantmoe, alt: "Merchant Moe" },
  { id: "initcapital", src: initcapital, alt: "INIT Capital" },
  { id: "mantlenetwork", src: mantlenetwork, alt: "Mantle Network" },
  { id: "methprotocol", src: methprotocol, alt: "METH Protocol" },
  { id: "ondo", src: ondo, alt: "Ondo Finance" },
  { id: "pendle", src: pendle, alt: "Pendle" },
  { id: "stargate", src: stargate, alt: "Stargate" },
  { id: "treehouse", src: treehouse, alt: "Treehouse" },
  { id: "discord", src: discord, alt: "Discord" },
  { id: "telegram", src: telegram, alt: "Telegram" },
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
