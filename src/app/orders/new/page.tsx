import { ChevronLeft, Plus, Trash2 } from 'lucide-react';

// Mock data for products in the dropdown
const mockProducts = [
  { id: 1, name: 'Double Chocolate Chip (Dozen)', price: 270.00 },
  { id: 2, name: 'Chocolate Chip (Dozen)', price: 200.00 },
  { id: 3, name: 'Raisin Oatmeal (Dozen)', price: 290.00 },
  { id: 4, name: 'Classic Banana Loaf', price: 250.00 },
  { id: 5, name: 'Raisin & Cashew Cinnamon Roll (Box of 4)', price: 220.00 },
];

// Mock data for items in the current order
const mockOrderItems = [
  { id: 1, product_name: 'Double Chocolate Chip (Dozen)', quantity: 2, subtotal: 540.00 },
  { id: 2, product_name: 'Classic Banana Loaf', quantity: 1, subtotal: 250.00 },
];

export default function OrderFormPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center">
        <button className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 ml-4">Create Order</h1>
      </header>

      <main className="p-6">
        <form className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white p-5 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-600 mb-1">Customer Name</label>
                <input type="text" id="customer_name" className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg" defaultValue="Maria Santos" />
              </div>
              <div>
                <label htmlFor="order_date" className="block text-sm font-medium text-gray-600 mb-1">Order Date</label>
                <input type="date" id="order_date" className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg" defaultValue="2025-10-28" />
              </div>
            </div>
          </div>

          {/* Add Order Item */}
          <div className="bg-white p-5 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Item</h2>
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-grow w-full">
                <label htmlFor="product" className="block text-sm font-medium text-gray-600 mb-1">Product</label>
                <select id="product" className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg">
                  {mockProducts.map(p => <option key={p.id} value={p.id}>{p.name} - ₱{p.price.toFixed(2)}</option>)}
                </select>
              </div>
              <div className="w-full md:w-auto">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
                <input type="number" id="quantity" defaultValue="1" className="w-full md:w-24 px-4 py-2 border-2 border-gray-200 rounded-lg" />
              </div>
              <button type="button" className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#A9DFBF] text-white font-semibold rounded-lg">
                <Plus size={18} /> Add Item
              </button>
            </div>
          </div>

          {/* Order Items List */}
          <div className="bg-white p-5 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Summary</h2>
            <div className="space-y-3">
              {mockOrderItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{item.product_name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-gray-800">₱{item.subtotal.toFixed(2)}</p>
                    <button type="button" className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-dashed">
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-gray-800">Order Total</p>
                <p className="text-xl font-bold text-gray-800">₱790.00</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button type="button" className="px-6 py-3 font-semibold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-6 py-3 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600">
              Save Order
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
