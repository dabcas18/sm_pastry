import { ChevronLeft } from 'lucide-react';

// Mock data for production view
const productionData = {
  cookies: [
    { name: 'Double Chocolate Chip', packs: 3, pieces: 0, total_pieces: 36, value: 810.00 },
    { name: 'Chocolate Chip', packs: 1, pieces: 6, total_pieces: 18, value: 400.00 },
    { name: 'Raisin Oatmeal', packs: 2, pieces: 0, total_pieces: 24, value: 580.00 },
  ],
  cinnamon_rolls: [
    { name: 'Raisin & Cashew', packs: 5, pieces: 0, total_pieces: 20, value: 1100.00 },
  ],
  muffins: [
    { name: 'Banana Cashew', packs: 0, pieces: 8, total_pieces: 8, value: 2400.00 },
  ],
};

const FilterButton = ({ children, isActive = false }: { children: React.ReactNode, isActive?: boolean }) => (
  <button
    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
      isActive
        ? 'bg-[#A9DFBF] text-white'
        : 'bg-white text-gray-600 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

export default function ProductionPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10">
        <button className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 ml-4">Production View</h1>
      </header>

      <main className="p-6">
        {/* Filters */}
        <div className="mb-6 bg-white p-3 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-2">Filter orders by status:</p>
          <div className="flex flex-wrap gap-2">
            <FilterButton isActive>Active</FilterButton>
            <FilterButton>Completed</FilterButton>
            <FilterButton>Unpaid</FilterButton>
            <FilterButton>All Orders</FilterButton>
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-6">
          {/* Cookies Category */}
          <div className="bg-white p-5 rounded-2xl shadow-md">
            <h2 className="text-lg font-bold text-gray-500 tracking-wider uppercase mb-4">COOKIES</h2>
            <div className="space-y-3">
              {productionData.cookies.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <p className="font-semibold text-gray-700">{item.name}</p>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{item.total_pieces} pieces</p>
                    <p className="text-sm text-gray-500">₱{item.value.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cinnamon Rolls Category */}
          <div className="bg-white p-5 rounded-2xl shadow-md">
            <h2 className="text-lg font-bold text-gray-500 tracking-wider uppercase mb-4">CINNAMON ROLLS</h2>
            <div className="space-y-3">
              {productionData.cinnamon_rolls.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <p className="font-semibold text-gray-700">{item.name}</p>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{item.total_pieces} pieces</p>
                    <p className="text-sm text-gray-500">₱{item.value.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Muffins Category */}
          <div className="bg-white p-5 rounded-2xl shadow-md">
            <h2 className="text-lg font-bold text-gray-500 tracking-wider uppercase mb-4">MUFFINS</h2>
            <div className="space-y-3">
              {productionData.muffins.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <p className="font-semibold text-gray-700">{item.name}</p>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{item.total_pieces} pieces</p>
                    <p className="text-sm text-gray-500">₱{item.value.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
