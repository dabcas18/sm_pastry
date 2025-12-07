'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

const steps = [
  { icon: '🛍️', label: 'Browse & Order', description: 'Pick your favorites' },
  { icon: '🔳', label: 'Scan QR to Pay', description: 'GCash or Mari' },
  { icon: '🤝', label: 'Pickup', description: 'Ready for you' },
];

function HowToOrder() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <h2 className="font-semibold text-gray-800 text-center mb-6 text-lg">How to Order</h2>

      {/* Steps row */}
      <div className="flex items-start justify-center">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {/* Step column: icon + label */}
            <div className="flex flex-col items-center w-20 sm:w-32 lg:w-40">
              {/* Icon */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                  index === activeStep
                    ? 'bg-[#82C3A3] scale-110 shadow-lg shadow-[#82C3A3]/30'
                    : index < activeStep
                    ? 'bg-[#82C3A3]'
                    : 'bg-gray-100'
                }`}
              >
                {index < activeStep ? (
                  <span className="text-white text-xl">✓</span>
                ) : (
                  <span className={`text-2xl sm:text-3xl transition-transform duration-300 ${index === activeStep ? 'animate-bounce' : ''}`}>
                    {step.icon}
                  </span>
                )}
              </div>
              {/* Label */}
              <p className={`text-xs sm:text-sm font-medium mt-3 text-center transition-colors duration-300 ${
                index <= activeStep ? 'text-[#82C3A3]' : 'text-gray-500'
              }`}>
                {step.label}
              </p>
              <p className={`text-[10px] sm:text-xs text-center transition-all duration-300 ${
                index === activeStep ? 'text-gray-400 opacity-100' : 'opacity-0'
              }`}>
                {step.description}
              </p>
            </div>
            {/* Line between steps */}
            {index < steps.length - 1 && (
              <div className={`w-6 sm:w-16 lg:w-24 h-0.5 -mt-10 transition-colors duration-500 ${
                index < activeStep ? 'bg-[#82C3A3]' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-2 mt-4">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveStep(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeStep ? 'bg-[#82C3A3] w-5' : 'bg-gray-200 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const productImages = [
  { src: '/products/cupcakes.png', alt: 'Red Velvet Cupcakes', rotate: 0, scale: 1.3, offsetX: 0, offsetY: 0 },
  { src: '/products/cookies.png', alt: 'Oatmeal Raisin Cookies', rotate: 90, scale: 1.8, offsetX: -15, offsetY: 10 },
  { src: '/products/brownies.png', alt: 'Fudge Brownies with Peanuts', rotate: 0, scale: 1, offsetX: 0, offsetY: 0 },
  { src: '/products/graham-balls.png', alt: 'Graham Balls', rotate: 90, scale: 1.4, offsetX: 0, offsetY: 0 },
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % productImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Hero Section - Compact */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Sisters & Mom Pastry Shop
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
            Freshly baked goods made with love. Pre-order your favorites today!
          </p>
        </div>

        {/* Product Showcase Carousel */}
        <div className="relative mb-6 overflow-hidden rounded-2xl shadow-lg">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {productImages.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0 relative aspect-[4/3] overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  style={{ transform: `rotate(${image.rotate}deg) scale(${image.scale}) translate(${image.offsetX}%, ${image.offsetY}%)` }}
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <p className="absolute bottom-4 left-4 text-white font-semibold text-lg drop-shadow-lg">
                  {image.alt}
                </p>
              </div>
            ))}
          </div>
          {/* Carousel Dots */}
          <div className="absolute bottom-4 right-4 flex gap-1.5">
            {productImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons - Order Now Primary */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-3">
          <Link
            href="/order"
            className="w-full sm:w-auto px-8 py-3 bg-[#82C3A3] text-white font-semibold rounded-xl active:bg-[#6BAF8B] transition-all text-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Order Now
          </Link>
          <Link
            href="/menu"
            className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl active:bg-gray-50 transition-all text-center"
          >
            View Menu
          </Link>
        </div>
        <div className="text-center mb-8">
          <Link
            href="/track"
            className="text-gray-400 hover:text-[#82C3A3] transition-colors text-sm"
          >
            Already ordered? Track your order →
          </Link>
        </div>

        {/* Instagram Profile Card */}
        <div className="mb-8 max-w-sm mx-auto">
          <a
            href="https://www.instagram.com/bysistersandmom/"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-[#121212] rounded-xl overflow-hidden hover:opacity-95 transition-opacity p-4">
              {/* Top Row: Profile Picture + Name + Follow Button */}
              <div className="flex items-center gap-3 mb-3">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <Image
                    src="/logo.jpg"
                    alt="@bysistersandmom"
                    width={56}
                    height={56}
                    className="rounded-full"
                  />
                </div>
                {/* Name */}
                <div className="flex-grow min-w-0">
                  <p className="text-white font-semibold text-sm">bysistersandmom</p>
                  <p className="text-gray-400 text-xs">Sisters & Mom</p>
                </div>
                {/* Follow Button */}
                <div className="flex-shrink-0 px-4 py-1.5 bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] text-white text-xs font-semibold rounded-lg">
                  Follow
                </div>
              </div>
              {/* Bio - Below */}
              <div className="text-sm">
                <p className="text-gray-400 text-xs mb-1">Product/service</p>
                <p className="text-white">From our home to yours 🏠</p>
                <p className="text-white">Freshly baked by sisters & mom 🍪</p>
                <p className="text-white">📍 Dau, Mabalacat, Pampanga</p>
                <p className="text-white">📩 DM for orders</p>
              </div>
            </div>
          </a>
        </div>

        {/* How It Works - Animated */}
        <HowToOrder />
      </main>

      <Footer />
    </div>
  );
}
