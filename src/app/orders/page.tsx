import { PlusCircle, Search } from 'lucide-react';

// Mock data to represent orders
const mockOrders = [
  {
    id: 1,
    customer_name: 'Maria Santos',
    order_date: 'Oct 28, 2025',
    total_amount: 1240.00,
    is_paid: true,
    is_completed: true,
  },
  {
    id: 2,
    customer_name: 'Juan Reyes',
    order_date: 'Oct 28, 2025',
    total_amount: 520.00,
    is_paid: false,
    is_completed: false,
  },
  {
    id: 3,
    customer_name: 'Anna Cruz',
    order_date: 'Oct 27, 2025',
    total_amount: 810.00,
    is_paid: true,
    is_completed: false,
  },
];

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <button className="text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <div className="h-10 w-10 bg-[#FADBD8] rounded-full flex items-center justify-center text-xs">Logo</div>
      </header>

      <main className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">All Orders</h1>

        {/* Actions */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by customer name..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FADBD8]"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#A9DFBF] text-white font-semibold rounded-xl hover:bg-[#82C3A3] transition-colors">
            <PlusCircle size={20} />
            New Order
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <div key={order.id} className={`p-5 rounded-2xl shadow-md ${order.is_completed ? 'bg-gray-100' : 'bg-white'}`}>
              <div className="flex flex-wrap justify-between items-start">
                <div className="mb-4 md:mb-0">
                  <p className={`font-bold text-xl ${order.is_completed ? 'text-gray-500' : 'text-gray-800'}`}>
                    {order.customer_name}
                  </p>
                  <p className="text-sm text-gray-500">{order.order_date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    order.is_paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {order.is_paid ? 'Paid' : 'Unpaid'}
                  </span>
                  <p className={`font-bold text-lg ${order.is_completed ? 'text-gray-500' : 'text-gray-800'}`}>
                    ₱{order.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
                {order.is_completed ? (
                  <button className="text-sm text-gray-500 font-medium px-4 py-2 rounded-lg bg-gray-200 cursor-not-allowed">
                    Completed
                  </button>
                ) : (
                  <button className="text-sm text-white font-medium px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600">
                    Mark Done
                  </button>
                )}
                <button className="text-sm text-gray-600 font-medium px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
                  Edit
                </button>
                <button className="text-sm text-white font-medium px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
