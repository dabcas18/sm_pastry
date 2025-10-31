'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Search, Calendar } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import OrderCard from '@/components/OrderCard';

type Order = {
  id: string;
  customer_name: string;
  order_date: string;
  total_amount: number;
  is_paid: boolean;
  is_completed: boolean;
  is_production_complete: boolean;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateCompletionStatus, setDateCompletionStatus] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [selectedDate, searchQuery, orders]);

  async function fetchOrders(preserveSelectedDate = false) {
    try {
      const { data, error } = await supabase
        .from('Orders')
        .select('*');

      if (error) throw error;

      setOrders(data || []);

      // Extract unique dates and sort chronologically (oldest first)
      const dates = Array.from(
        new Set(data?.map(o => new Date(o.order_date).toISOString().split('T')[0]) || [])
      ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      setAvailableDates(dates);

      // Calculate completion status for each date
      const completionMap = new Map<string, boolean>();
      dates.forEach(date => {
        const ordersForDate = data?.filter(o =>
          new Date(o.order_date).toISOString().split('T')[0] === date
        ) || [];
        const allCompleted = ordersForDate.length > 0 && ordersForDate.every(o => o.is_completed);
        completionMap.set(date, allCompleted);
      });
      setDateCompletionStatus(completionMap);

      // Only auto-select date if not preserving current selection
      if (!preserveSelectedDate || !selectedDate) {
        // Auto-select earliest date with incomplete orders
        const earliestIncompleteDate = dates.find(date => !completionMap.get(date));
        if (earliestIncompleteDate) {
          setSelectedDate(earliestIncompleteDate);
        } else if (dates.length > 0) {
          // If all dates are complete, select the first date
          setSelectedDate(dates[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  function filterOrders() {
    let filtered = orders;

    // Filter by selected date
    if (selectedDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.order_date).toISOString().split('T')[0];
        return orderDate === selectedDate;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(order =>
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort: incomplete first, then by creation time (oldest first)
    filtered.sort((a, b) => {
      // Primary sort: incomplete orders first
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }
      // Secondary sort: oldest order first (by created_at timestamp)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    setFilteredOrders(filtered);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatOrderDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const ordersWithFormattedDates = filteredOrders.map(order => ({
    ...order,
    formattedDate: formatOrderDate(order.order_date)
  }));

  return (
    <AppLayout title="All Orders">
      <div className="min-h-full">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#FFF8F5] pb-4 pt-6 px-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 hidden lg:block">All Orders</h1>

          {/* Date Selector */}
          <div className="mb-4 bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-gray-500" />
              <p className="text-xs font-medium text-gray-600">Select Order Date:</p>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-1.5 min-w-max">
                {availableDates.map(date => {
                  const isCompleted = dateCompletionStatus.get(date);
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors whitespace-nowrap ${
                        selectedDate === date
                          ? isCompleted
                            ? 'bg-gray-400 text-white'
                            : 'bg-[#A9DFBF] text-white'
                          : isCompleted
                          ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {formatDate(date)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#A9DFBF] focus:border-[#A9DFBF] text-sm"
              />
            </div>
            <Link href="/orders/new" className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#A9DFBF] text-white font-medium rounded-md hover:bg-[#82C3A3] transition-colors text-sm">
              <PlusCircle size={18} />
              New Order
            </Link>
          </div>
        </div>

        {/* Orders List */}
        <main className="px-6 pb-6">
          {ordersWithFormattedDates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No orders found for selected date.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ordersWithFormattedDates.map((order) => (
                <OrderCard key={order.id} order={order} onUpdate={() => fetchOrders(true)} />
              ))}
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}
