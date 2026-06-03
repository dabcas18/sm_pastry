import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      <Header />

      <main className="container mx-auto px-6 py-12 flex flex-col items-center justify-center">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-6xl mb-6">🍪🧁🍞</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Something Better is in the Oven</h1>
          <p className="text-lg text-gray-600 mb-2">
            We&apos;re fine-tuning our menu to bring you an even better selection of freshly baked goodies.
          </p>
          <p className="text-gray-500 mb-8">
            In the meantime, reach out and we&apos;ll walk you through everything we have to offer!
          </p>

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
