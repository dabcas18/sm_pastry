import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      <Header />

      {/* Menu Content */}
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Menu & Pricelist</h1>

        {/* Price List Image */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 md:p-8">
          <Image
            src="/menu.png"
            alt="Sisters & Mom Menu - Cookies, Cinnamon Rolls, Sandwiches, Mallows, Muffins, Cakes, Loaves, and More"
            width={1200}
            height={1600}
            className="w-full h-auto rounded-lg"
            priority
          />
        </div>

        {/* Contact Info */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">For orders, send us a message!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://www.instagram.com/bysistersandmom/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              📷 @bysistersandmom
            </a>
            <a
              href="tel:09178158007"
              className="px-6 py-3 bg-[#82C3A3] text-white font-semibold rounded-lg hover:bg-[#6BAF8B] transition-all"
            >
              📱 0917-815-8007
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
