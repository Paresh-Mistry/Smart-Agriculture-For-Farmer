"use client";

import Link from "next/link";
import React from "react";
import { AutoTranslate } from "./AutoTranslate";

const Hero: React.FC = () => {
  return (
    <AutoTranslate>
      <div className="flex flex-col items-center justify-center text-center px-4 py-24 lg:py-32 bg-no-repeat bg-cover bg-[url('https://img.freepik.com/free-vector/digital-technology-background-with-hexagon-frame-white-tone_53876-117507.jpg?t=st=1744432931~exp=1744436531~hmac=114e9bc2ec9f9d84ae0be428d5754a03a17d9da63c2a8a956f787dca0df3415d&w=1380')]">
        <Link
          href="#"
          className="border border-gray-300 rounded-lg lg:py-2 lg:px-4 py-1 px-2 text-gray-600 text-sm mb-5 transition duration-300 ease-in-out hover:text-gray-800"
        >
          Empowering farmers with smart tools
        </Link>

        <h1 style={{fontFamily:"'Playfair Display', Georgia, serif"}} className="mx-auto max-w-4xl font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-gray-800">
          Smart Agriculture for Sustainable Farming  <br />
          <span className="relative whitespace-nowrap text-[#04a091]">
            <svg
              aria-hidden="true"
              viewBox="0 0 418 42"
              className="absolute top-2/3 left-0 h-[0.58em] w-full fill-[#00beac]"
              preserveAspectRatio="none"
            >
              <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.780 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.540-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.810 23.239-7.825 27.934-10.149 28.304-14.005 .417-4.348-3.529-6-16.878-7.066Z"></path>
            </svg>
            <span className="relative">
              using AI
            </span>
          </span>
        </h1>

        <h2 style={{fontFamily: "'Lora', Georgia, serif"}} className="mt-6 sm:mt-10 leading-relaxed mx-auto max-w-lg text-base sm:text-lg text-[#40916c]">

          Monitor crops, optimize irrigation, predict yields, and connect with
          buyers all in one platform designed for modern farmers.

        </h2>

        <div className="animate-fade-up-4 mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/farmer/dashboard"
                className="hero-cta group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1b4332] text-[#d8f3dc] shadow-lg shadow-[#1b4332]/30 transition-all duration-300 hover:bg-[#2d6a4f] hover:shadow-xl hover:shadow-[#2d6a4f]/40 hover:-translate-y-0.5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:rotate-12">
                  <path d="M12 2C8 6 4 8 4 13a8 8 0 0016 0c0-5-4-7-8-11z" fill="#95d5b2"/>
                </svg>
                Get Started for Free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="#95d5b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>

              <Link
                href="#"
                className="hero-cta inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#52796f] text-[#1b4332] bg-white/60 backdrop-blur-sm transition-all duration-300 hover:bg-white/90 hover:border-[#2d6a4f]"
              >
                Learn How It Works
              </Link>
            </div>
            <div className="animate-fade-up-4 mt-12 flex flex-wrap justify-center gap-6 text-sm text-[#52796f]">
              {["10,000+ Farmers", "Real-time Data", "AI-Powered Insights"].map((item) => (
                <span key={item} className="flex items-center gap-1.5 font-medium" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#40916c" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {item}
                </span>
              ))}
            </div>
             <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#d8f3dc]/30 to-transparent pointer-events-none" />
      </div>
    </AutoTranslate>
  );
};

export default Hero;
