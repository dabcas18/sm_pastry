'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  Star,
  Instagram,
  MapPin,
  Mail,
  Package,
  ArrowRight,
  Heart,
  QrCode
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const FEATURED_ITEMS = [
  {
    id: 1,
    title: "Red Velvet Cupcakes",
    description: "Classic Southern velvet sponge with rich cream cheese frosting.",
    image: "/products/cupcakes.png",
    price: "₱180 / 6pcs"
  },
  {
    id: 2,
    title: "Oatmeal Raisin Cookies",
    description: "Chewy, buttery cookies loaded with plump raisins and hearty oats.",
    image: "/products/cookies.png",
    price: "₱150 / dozen"
  },
  {
    id: 3,
    title: "Fudge Brownies",
    description: "Rich, fudgy brownies with a perfect crackly top and gooey center.",
    image: "/products/brownies.png",
    price: "₱200 / 9pcs"
  },
  {
    id: 4,
    title: "Graham Balls",
    description: "Sweet and creamy no-bake treats coated in graham crumbs.",
    image: "/products/graham-balls.png",
    price: "₱120 / 12pcs"
  }
];

export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FEATURED_ITEMS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % FEATURED_ITEMS.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + FEATURED_ITEMS.length) % FEATURED_ITEMS.length);

  return (
    <div className="min-h-screen text-brand-dark overflow-x-hidden selection:bg-brand-green selection:text-white bg-brand-bg">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-8 md:pt-12 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[80vh] md:min-h-[85vh] flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="flex-1 text-center lg:text-left z-10 fade-in-up">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold uppercase tracking-widest mb-6 border border-brand-green/20">
            <Star className="w-3 h-3 mr-1.5 fill-current" /> Premium Homemade Pastries
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold leading-[1.1] mb-6 text-brand-dark">
            Freshly baked <br/>
            <span className="text-brand-green italic relative">
              with love
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300 -z-10 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span> everyday.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
            Pre-order your favorite homemade treats today. From our home kitchen to yours, serving the sweetest moments in Dau, Mabalacat.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
            <Link
              href="/order"
              className="px-8 py-4 bg-brand-green text-white rounded-full font-bold text-lg shadow-xl shadow-brand-green/30 hover:shadow-2xl hover:bg-brand-green-dark transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Order <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/menu"
              className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center shadow-sm"
            >
              View Menu
            </Link>
          </div>

          <Link href="/track" className="inline-block text-sm font-medium text-gray-400 hover:text-brand-green transition-colors border-b border-transparent hover:border-brand-green pb-0.5">
            Already ordered? Track your order &rarr;
          </Link>

          <div className="mt-10 md:mt-12 flex items-center justify-center lg:justify-start gap-4">
            <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-brand-green/20 flex items-center justify-center text-brand-green text-xs font-bold">
                   <Heart className="w-4 h-4 fill-current" />
                 </div>
               ))}
               <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">+99</div>
            </div>
            <div className="text-sm">
              <div className="flex text-yellow-400 mb-0.5">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="font-medium text-gray-500">Happy Customers</span>
            </div>
          </div>
        </div>

        <div className="flex-1 relative w-full max-w-md lg:max-w-xl fade-in-up delay-200 px-4">
          {/* Main Hero Image/Slider Card */}
          <div className="relative aspect-[4/5] md:aspect-square rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl group ring-4 md:ring-8 ring-white">
             {FEATURED_ITEMS.map((item, idx) => (
                <div
                  key={item.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    priority={idx === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                     <div className="inline-block px-3 py-1 bg-brand-green rounded-lg text-xs font-bold mb-3 uppercase tracking-wider">Featured</div>
                     <h3 className="text-2xl md:text-4xl font-serif font-bold mb-2 leading-tight">{item.title}</h3>
                     <p className="text-gray-200 mb-4 md:mb-6 line-clamp-2 font-light opacity-90 text-sm md:text-base">{item.description}</p>
                     <div className="flex items-center justify-between">
                       <span className="font-bold text-xl md:text-2xl tracking-tight">{item.price}</span>
                       <Link
                         href="/order"
                         className="bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-brand-green p-3 md:p-3.5 rounded-full transition-all"
                       >
                         <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                       </Link>
                     </div>
                  </div>
                </div>
             ))}

             {/* Slider Controls */}
             <button onClick={prevSlide} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-2 md:p-3 rounded-full text-white hover:bg-white hover:text-brand-dark transition-all opacity-0 group-hover:opacity-100 z-20">
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
             </button>
             <button onClick={nextSlide} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-2 md:p-3 rounded-full text-white hover:bg-white hover:text-brand-dark transition-all opacity-0 group-hover:opacity-100 z-20">
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
             </button>

             {/* Slide Indicators */}
             <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
               {FEATURED_ITEMS.map((_, idx) => (
                 <button
                   key={idx}
                   onClick={() => setActiveSlide(idx)}
                   className={`h-1.5 rounded-full transition-all duration-500 ${idx === activeSlide ? 'bg-white w-6 md:w-8' : 'bg-white/30 w-3 md:w-4'}`}
                 />
               ))}
             </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-12 -right-12 w-48 md:w-64 h-48 md:h-64 bg-brand-green rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-12 -left-12 w-48 md:w-64 h-48 md:h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        </div>
      </section>

      {/* Social Proof / Instagram Section */}
      <section className="py-16 md:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="order-2 md:order-1 fade-in-up">
                 <a
                   href="https://www.instagram.com/bysistersandmom/"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="block"
                 >
                   <div className="bg-brand-dark text-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl max-w-md mx-auto relative overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500 rounded-full blur-[80px] opacity-30 pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500 rounded-full blur-[80px] opacity-30 pointer-events-none"></div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500">
                             <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-900">
                               <Image
                                 src="/logo.jpg"
                                 alt="Profile"
                                 width={60}
                                 height={60}
                                 className="object-cover w-full h-full"
                               />
                             </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-base md:text-lg leading-none mb-1">bysistersandmom</h3>
                            <p className="text-gray-400 text-xs">Sisters & Mom</p>
                          </div>
                          <div className="bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-4 md:px-5 py-1.5 rounded-lg text-xs md:text-sm font-semibold">
                            Follow
                          </div>
                        </div>

                        <div className="space-y-2 mb-6 text-sm font-light">
                          <p className="text-gray-300">
                            <span className="text-gray-500 font-bold mr-2 text-xs">Product/service</span><br/>
                            From our home to yours 🏠 <br/>
                            Freshly baked by sisters & mom 🍪 <br/>
                            📍 Dau, Mabalacat, Pampanga <br/>
                            📩 DM for orders
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {FEATURED_ITEMS.slice(0, 3).map((item) => (
                             <div key={item.id} className="aspect-square bg-gray-800 rounded-md overflow-hidden relative group cursor-pointer">
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                  <Heart className="w-6 h-6 fill-white text-white" />
                                </div>
                             </div>
                          ))}
                        </div>
                      </div>
                   </div>
                 </a>
              </div>

              <div className="order-1 md:order-2 text-center md:text-left fade-in-up delay-100">
                 <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 text-brand-dark">Join our Sweet Community</h2>
                 <p className="text-gray-600 text-base md:text-lg mb-8 font-light">
                   Stay updated with our latest creations, special offers, and behind-the-scenes moments. Tag us in your photos to be featured on our page!
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <a
                      href="https://www.instagram.com/bysistersandmom/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 text-white rounded-full font-bold hover:shadow-lg transition-all transform hover:-translate-y-1"
                    >
                      <Instagram className="w-5 h-5" /> Follow on Instagram
                    </a>
                    <a
                      href="https://ig.me/m/bysistersandmom"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-all transform hover:-translate-y-1"
                    >
                      <Mail className="w-5 h-5" /> Message Us
                    </a>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-24 bg-brand-pink/40 relative overflow-hidden">
        {/* Floating Background Icons */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-[0.03] pointer-events-none">
           <div className="absolute top-10 left-10 text-7xl md:text-9xl transform -rotate-12">🧁</div>
           <div className="absolute bottom-20 right-10 text-7xl md:text-9xl transform rotate-12">🍪</div>
           <div className="absolute top-1/2 left-1/4 text-6xl md:text-8xl transform rotate-45">🍰</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-20">
            <span className="text-brand-green font-bold tracking-widest uppercase text-xs mb-2 block">Simple Process</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-brand-dark">How to Order</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
             {/* Connecting Line (Desktop) */}
             <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-300 -z-10 border-t-2 border-dashed border-gray-300"></div>

             {[
               { icon: <Package className="w-7 h-7 md:w-8 md:h-8" />, title: "Browse & Order", desc: "Select your favorites from our menu and place your order.", color: "bg-brand-green" },
               { icon: <QrCode className="w-7 h-7 md:w-8 md:h-8" />, title: "Scan QR to Pay", desc: "Pay via GCash or MariBank by scanning our QR code.", color: "bg-brand-green" },
               { icon: <Heart className="w-7 h-7 md:w-8 md:h-8" />, title: "Pickup & Enjoy", desc: "Collect your freshly baked goods or book a courier.", color: "bg-amber-400" }
             ].map((step, idx) => (
               <div key={idx} className="flex flex-col items-center text-center group">
                 <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${step.color} shadow-xl shadow-gray-200/50 flex items-center justify-center text-white mb-6 md:mb-8 transform transition-transform group-hover:scale-110 duration-300 relative`}>
                    {step.icon}
                    <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center font-bold text-brand-dark text-base md:text-lg shadow-md border-2 border-gray-50">
                      {idx + 1}
                    </div>
                 </div>
                 <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-brand-dark">{step.title}</h3>
                 <p className="text-gray-600 max-w-xs leading-relaxed text-sm md:text-base">{step.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Featured Menu Preview (Grid) */}
      <section id="menu" className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4">
           <div>
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2 md:mb-3 text-brand-dark">Popular Treats</h2>
             <p className="text-gray-500 text-base md:text-lg">Our customer favorites this week</p>
           </div>
           <Link href="/menu" className="hidden sm:flex items-center text-brand-green font-bold hover:underline text-base md:text-lg group">
             View Full Menu <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
           {FEATURED_ITEMS.map((item) => (
             <div key={item.id} className="group bg-white rounded-2xl md:rounded-[2rem] p-3 md:p-4 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
                <div className="relative aspect-[4/3] rounded-xl md:rounded-[1.5rem] overflow-hidden mb-4 md:mb-5">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                  <Link
                    href="/order"
                    className="absolute bottom-3 md:bottom-4 right-3 md:right-4 bg-white p-2.5 md:p-3 rounded-full shadow-lg hover:bg-brand-green hover:text-white transition-colors"
                  >
                     <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </Link>
                </div>
                <div className="px-2 md:px-3 pb-2 md:pb-4">
                  <h3 className="text-lg md:text-xl font-serif font-bold mb-1 md:mb-2 text-brand-dark">{item.title}</h3>
                  <p className="text-gray-500 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2 font-light">{item.description}</p>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 md:pt-4">
                     <span className="font-bold text-brand-green text-base md:text-lg">{item.price}</span>
                     <div className="flex text-yellow-400 text-sm items-center font-bold">
                       <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current mr-1" />
                       <span className="text-gray-400 text-xs md:text-sm">5.0</span>
                     </div>
                  </div>
                </div>
             </div>
           ))}
        </div>

        <div className="mt-8 md:mt-12 text-center sm:hidden">
          <Link href="/menu" className="inline-flex items-center text-brand-green font-bold hover:underline text-base">
             View Full Menu <ArrowRight className="w-5 h-5 ml-2" />
           </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-white pt-16 md:pt-24 pb-8 md:pb-12 rounded-t-[2rem] md:rounded-t-[3rem] mt-8 md:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-20">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center gap-3 mb-6">
                  <Image
                    src="/logo.jpg"
                    alt="Sisters & Mom"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <span className="font-serif font-bold text-xl md:text-2xl">Sisters & Mom</span>
               </div>
               <p className="text-gray-400 max-w-sm mb-8 leading-relaxed font-light text-sm md:text-base">
                 Baking the world a better place, one treat at a time. Crafted with passion by sisters and their mom, served with love.
               </p>
               <div className="flex gap-4">
                 <a href="https://www.instagram.com/bysistersandmom/" target="_blank" rel="noopener noreferrer" className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-green hover:border-brand-green transition-all"><Instagram className="w-5 h-5" /></a>
                 <a href="https://ig.me/m/bysistersandmom" target="_blank" rel="noopener noreferrer" className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-green hover:border-brand-green transition-all"><Mail className="w-5 h-5" /></a>
               </div>
            </div>

            <div>
              <h4 className="font-bold text-base md:text-lg mb-6 md:mb-8 text-brand-pink">Quick Links</h4>
              <ul className="space-y-3 md:space-y-4 text-gray-400 text-sm md:text-base">
                <li><Link href="/menu" className="hover:text-white transition-colors">View Menu</Link></li>
                <li><Link href="/order" className="hover:text-white transition-colors">Order Now</Link></li>
                <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-base md:text-lg mb-6 md:mb-8 text-brand-pink">Contact</h4>
              <ul className="space-y-3 md:space-y-4 text-gray-400 text-sm md:text-base">
                <li className="flex items-start gap-3">
                   <MapPin className="w-5 h-5 flex-shrink-0 text-brand-green mt-0.5" />
                   <span>Blk 13 Lot 14 Dahlia St. Pineda Subdivision, Dau, Mabalacat, Pampanga</span>
                </li>
                <li className="flex items-center gap-3">
                   <Mail className="w-5 h-5 flex-shrink-0 text-brand-green" />
                   <span>DM us on Instagram</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-gray-500 font-light">
            <p>&copy; 2025 Sisters & Mom Pastry Shop. All rights reserved.</p>
            <p className="flex items-center gap-1">Built with <Heart className="w-3 h-3 text-red-500 fill-current" /> by DABCAS Digital Solutions</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
