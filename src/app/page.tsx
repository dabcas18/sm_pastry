import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      {/* Header with Admin Login */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Sisters & Mom Pastry Shop"
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <h2 className="font-bold text-gray-800 text-lg leading-tight">
                Sisters & Mom<br/>
                <span className="text-xs text-gray-500 font-normal">Pastry Shop</span>
              </h2>
            </div>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Logo and Brand */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="mb-6">
              <Image
                src="/logo.jpg"
                alt="Sisters & Mom Pastry Shop"
                width={160}
                height={160}
                className="rounded-full shadow-lg"
              />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Sisters & Mom Pastry Shop
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Freshly baked goods made with love. From cookies and cinnamon rolls to sandwiches and muffins, we bring homemade quality to every order.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/menu"
              className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-[#82C3A3] text-[#82C3A3] font-semibold rounded-lg hover:bg-[#82C3A3] hover:text-white transition-colors text-center text-lg"
            >
              View Menu
            </Link>
            <Link
              href="/order"
              className="w-full sm:w-auto px-8 py-4 bg-[#82C3A3] text-white font-semibold rounded-lg hover:bg-[#6BAF8B] transition-colors text-lg text-center"
            >
              Order Now
            </Link>
          </div>

          {/* Instagram Section */}
          <div className="mb-16 max-w-2xl mx-auto">
            <div className="bg-black rounded-lg shadow-md border border-gray-800 p-4 mb-3">
              <div className="flex items-start gap-3">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <Image
                    src="/logo.jpg"
                    alt="@bysistersandmom"
                    width={90}
                    height={90}
                    className="rounded-full"
                  />
                </div>

                {/* Profile Info - height matches image */}
                <div className="flex-grow min-h-[90px] flex flex-col justify-center">
                  {/* Name and Category */}
                  <h3 className="font-bold text-white text-xs leading-tight mb-0.5">Sisters & Mom</h3>
                  <p className="text-[9px] text-gray-400 mb-1">Product/service</p>

                  {/* Bio */}
                  <div className="text-[9px] text-white leading-tight space-y-0.5">
                    <p>From our home to yours 🏡</p>
                    <p>Freshly baked by sisters & mom</p>
                    <p className="whitespace-nowrap">📍 Dau, Mabalacat, Pampanga</p>
                    <p>📩 DM for orders</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <a
              href="https://www.instagram.com/bysistersandmom/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm"
            >
              Follow on Instagram
            </a>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-4xl mb-3">🍪</div>
              <h3 className="font-bold text-gray-800 mb-2">Fresh Daily</h3>
              <p className="text-sm text-gray-600">
                All our products are baked fresh daily using quality ingredients.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-4xl mb-3">🎂</div>
              <h3 className="font-bold text-gray-800 mb-2">Wide Selection</h3>
              <p className="text-sm text-gray-600">
                Cookies, cinnamon rolls, muffins, sandwiches, loaves, and more!
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-4xl mb-3">💝</div>
              <h3 className="font-bold text-gray-800 mb-2">Made with Love</h3>
              <p className="text-sm text-gray-600">
                Family recipes passed down with care and attention to detail.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-6 py-8 text-center text-gray-600 text-sm">
          <p>&copy; 2025 Sisters & Mom Pastry Shop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
