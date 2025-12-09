'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Instagram, Mail, Phone, ArrowRight } from 'lucide-react';

type HeaderProps = {
  rightContent?: React.ReactNode;
};

export default function Header({ rightContent }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isMenuOpen ? 'bg-transparent' : 'glass-card shadow-sm'} top-0 left-0`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity relative z-50" onClick={() => setIsMenuOpen(false)}>
              <Image
                src="/logo.jpg"
                alt="Sisters & Mom"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-semibold text-gray-800 text-xl md:text-2xl tracking-tight">Sisters & Mom</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8 font-medium">
              <Link href="/" className="text-gray-600 hover:text-brand-green transition-colors">Home</Link>
              <Link href="/menu" className="text-gray-600 hover:text-brand-green transition-colors">Menu</Link>
              <Link href="/track" className="text-gray-600 hover:text-brand-green transition-colors">Track Order</Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {rightContent || (
                <Link
                  href="/order"
                  className="bg-brand-green text-white px-6 py-2.5 rounded-full hover:bg-brand-green-dark transition-transform transform hover:scale-105 shadow-lg shadow-brand-green/30 text-sm font-semibold tracking-wide"
                >
                  Order Now
                </Link>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center z-50">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-full transition-all duration-300 ${isMenuOpen ? 'bg-white shadow-md rotate-90' : 'hover:bg-gray-100'}`}
              >
                {isMenuOpen ? <X className="w-6 h-6 text-brand-green" /> : <Menu className="w-6 h-6 text-gray-600" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modern Full-Screen Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-brand-bg md:hidden flex flex-col animate-fade-in">
          {/* Decorative Background Blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-green rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse pointer-events-none"></div>

          <div className="flex-1 flex flex-col justify-center items-center px-6 space-y-8 relative z-10">
            <nav className="flex flex-col items-center space-y-6">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-4xl font-serif font-bold text-brand-dark hover:text-brand-green transition-all transform hover:scale-105"
              >
                Home
              </Link>
              <Link
                href="/menu"
                onClick={() => setIsMenuOpen(false)}
                className="text-4xl font-serif font-bold text-brand-dark hover:text-brand-green transition-all transform hover:scale-105"
              >
                Menu
              </Link>
              <Link
                href="/track"
                onClick={() => setIsMenuOpen(false)}
                className="text-4xl font-serif font-bold text-brand-dark hover:text-brand-green transition-all transform hover:scale-105"
              >
                Track Order
              </Link>
            </nav>

            <div className="w-16 h-1 bg-brand-dark/10 rounded-full"></div>

            <div className="flex flex-col items-center space-y-6 w-full max-w-xs">
              <Link
                href="/order"
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-4 bg-brand-green text-white rounded-full font-bold text-lg shadow-xl hover:bg-brand-green-dark transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Order Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-4 pt-4">
              <a
                href="https://www.instagram.com/bysistersandmom/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-green hover:scale-110 transition-all"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="mailto:imdenisalimpolos@gmail.com"
                className="text-gray-400 hover:text-brand-green hover:scale-110 transition-all"
              >
                <Mail className="w-6 h-6" />
              </a>
              <a
                href="tel:09178158007"
                className="text-gray-400 hover:text-brand-green hover:scale-110 transition-all"
              >
                <Phone className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20" />
    </>
  );
}
