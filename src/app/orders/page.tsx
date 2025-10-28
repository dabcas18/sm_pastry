import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import OrderCard from '@/components/OrderCard';

// Force dynamic rendering to fetch fresh data on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getOrders() {
  const { data, error } = await supabase
    .from('Orders')
    .select('*')
    .order('order_date', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function OrdersPage() {
  const orders = await getOrders();

  // Format dates on the server side
  const ordersWithFormattedDates = orders.map(order => ({
    ...order,
    formattedDate: formatDate(order.order_date)
  }));

  return (
    <AppLayout>
      <div className="min-h-full">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#FFF8F5] pb-4 pt-6 px-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">All Orders</h1>

          {/* Actions */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by customer name..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FADBD8]"
              />
            </div>
            <Link href="/orders/new" className="flex items-center justify-center gap-2 px-6 py-3 bg-[#A9DFBF] text-white font-semibold rounded-xl hover:bg-[#82C3A3] transition-colors">
              <PlusCircle size={20} />
              New Order
            </Link>
          </div>
        </div>

        {/* Orders List */}
        <main className="px-6 pb-6">
          {ordersWithFormattedDates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No orders yet. Create your first order!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ordersWithFormattedDates.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}
