'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';

type BakerProduct = {
  product_name: string;
  quantity: number;
  unit_type: string;
  pieces_per_pack: number | null;
  revenue: number;
};

type BakerSales = {
  baker_name: string;
  total_revenue: number;
  products: BakerProduct[];
};

type UnpaidOrder = {
  order_id: string;
  customer_name: string;
  total_amount: number;
};

export default function SalesDashboardPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [overallSales, setOverallSales] = useState(0);
  const [selectedDateSales, setSelectedDateSales] = useState(0);
  const [bakerSales, setBakerSales] = useState<BakerSales[]>([]);
  const [unpaidOrders, setUnpaidOrders] = useState<UnpaidOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableDates();
    fetchOverallSales();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSelectedDateSales(selectedDate);
    }
  }, [selectedDate]);

  async function fetchAvailableDates() {
    try {
      const { data: orders, error } = await supabase
        .from('Orders')
        .select('order_date');

      if (error) throw error;

      const dates = Array.from(new Set(orders?.map(o => new Date(o.order_date).toISOString().split('T')[0]) || [])).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      setAvailableDates(dates);

      if (dates.length > 0) {
        setSelectedDate(dates[dates.length - 1]); // Default to most recent date
      }
    } catch (error) {
      console.error('Error fetching dates:', error);
    }
  }

  async function fetchOverallSales() {
    try {
      const { data: orders, error } = await supabase
        .from('Orders')
        .select('total_amount');

      if (error) throw error;

      const total = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      setOverallSales(total);
    } catch (error) {
      console.error('Error fetching overall sales:', error);
    }
  }

  async function fetchSelectedDateSales(date: string) {
    setLoading(true);
    try {
      // Fetch orders for selected date
      const { data: orders, error: ordersError } = await supabase
        .from('Orders')
        .select('id, total_amount, customer_name, is_paid')
        .gte('order_date', `${date}T00:00:00`)
        .lt('order_date', `${date}T23:59:59`);

      if (ordersError) throw ordersError;

      const dateSales = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      setSelectedDateSales(dateSales);

      // Filter unpaid orders
      const unpaid = orders?.filter(o => !o.is_paid).map(o => ({
        order_id: o.id,
        customer_name: o.customer_name,
        total_amount: Number(o.total_amount)
      })) || [];
      setUnpaidOrders(unpaid);

      // Fetch order items with product details for this date
      const orderIds = orders?.map(o => o.id) || [];
      if (orderIds.length > 0) {
        const { data: orderItems, error: itemsError } = await supabase
          .from('OrderItems')
          .select(`
            quantity,
            subtotal,
            Products (
              name,
              baker,
              unit_type,
              pieces_per_pack
            )
          `)
          .in('order_id', orderIds);

        if (itemsError) throw itemsError;

        // Group by baker
        const bakerMap = new Map<string, BakerSales>();

        orderItems?.forEach((item: any) => {
          const bakerName = item.Products?.baker || 'Unassigned';
          const productName = item.Products?.name || 'Unknown';
          const revenue = Number(item.subtotal);
          const quantity = item.quantity;

          let bakerData = bakerMap.get(bakerName);
          if (!bakerData) {
            bakerData = {
              baker_name: bakerName,
              total_revenue: 0,
              products: []
            };
            bakerMap.set(bakerName, bakerData);
          }

          bakerData.total_revenue += revenue;

          // Check if product already exists
          const existingProduct = bakerData.products.find(p => p.product_name === productName);
          if (existingProduct) {
            existingProduct.quantity += quantity;
            existingProduct.revenue += revenue;
          } else {
            bakerData.products.push({
              product_name: productName,
              quantity: quantity,
              unit_type: item.Products?.unit_type || 'piece',
              pieces_per_pack: item.Products?.pieces_per_pack,
              revenue: revenue
            });
          }
        });

        // Convert to array and sort bakers by name
        const bakers = Array.from(bakerMap.values()).sort((a, b) => {
          const order = ['Anna', 'Nicole', 'Mommy'];
          return order.indexOf(a.baker_name) - order.indexOf(b.baker_name);
        });

        setBakerSales(bakers);
      } else {
        setBakerSales([]);
      }
    } catch (error) {
      console.error('Error fetching selected date sales:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsPaid(orderId: string) {
    setUpdatingPayment(orderId);
    try {
      const { error } = await supabase
        .from('Orders')
        .update({ is_paid: true })
        .eq('id', orderId);

      if (error) throw error;

      // Refresh the selected date data
      if (selectedDate) {
        await fetchSelectedDateSales(selectedDate);
        await fetchOverallSales();
      }
    } catch (error) {
      console.error('Error marking order as paid:', error);
      alert('Failed to mark order as paid');
    } finally {
      setUpdatingPayment(null);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatQuantity(quantity: number, unitType: string, piecesPerPack: number | null): string {
    if (unitType === 'pack' && piecesPerPack) {
      return `${quantity} pack${quantity > 1 ? 's' : ''}`;
    }
    return `${quantity} pc${quantity > 1 ? 's' : ''}`;
  }

  return (
    <AppLayout title="Sales Dashboard">
      <div className="min-h-full">
        <main className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 hidden lg:block">Sales Dashboard</h1>

          {/* Date Selector */}
          <div className="mb-4 bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-gray-500" />
              <p className="text-xs font-medium text-gray-600">Select Order Date:</p>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-1.5 min-w-max">
                {availableDates.map(date => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors whitespace-nowrap ${
                      selectedDate === date
                        ? 'bg-[#A9DFBF] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {formatDate(date)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="text-blue-600" size={18} />
                <p className="text-xs text-blue-600 font-semibold">Overall Sales (All Dates)</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">₱{overallSales.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-green-600 font-bold text-lg">₱</span>
                <p className="text-xs text-green-600 font-semibold">Selected Date Sales</p>
              </div>
              <p className="text-2xl font-bold text-green-700">₱{selectedDateSales.toFixed(2)}</p>
            </div>
          </div>

          {/* Baker Sales Breakdown */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Loading sales data...</p>
            </div>
          ) : bakerSales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No sales for selected date</p>
            </div>
          ) : (
            <>
              {/* Baker Sales Cards */}
              <div className="space-y-2 mb-4">
                {bakerSales.map(baker => (
                  <div key={baker.baker_name} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-[#A9DFBF]">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-base font-bold text-gray-800">{baker.baker_name}</h2>
                      <p className="text-base font-bold text-[#A9DFBF]">₱{baker.total_revenue.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      {baker.products.map((product, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{product.product_name}</p>
                            <p className="text-xs text-gray-500">
                              {formatQuantity(product.quantity, product.unit_type, product.pieces_per_pack)}
                            </p>
                          </div>
                          <p className="font-bold text-gray-700 text-sm">₱{product.revenue.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Unpaid Orders Section */}
              {unpaidOrders.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertCircle className="text-orange-600" size={18} />
                    <h2 className="text-sm font-bold text-orange-800">Unpaid Orders for Selected Date</h2>
                  </div>
                  <div className="space-y-1">
                    {unpaidOrders.map(order => (
                      <div key={order.order_id} className="flex justify-between items-center p-2 bg-white rounded-md">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm">{order.customer_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-orange-600 text-sm">₱{order.total_amount.toFixed(2)}</p>
                          <button
                            onClick={() => handleMarkAsPaid(order.order_id)}
                            disabled={updatingPayment === order.order_id}
                            className="px-3 py-1.5 bg-[#82C3A3] text-white rounded-md font-medium text-xs hover:bg-[#6BAF8B] transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                          >
                            {updatingPayment === order.order_id ? 'Updating...' : 'Mark as Paid'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </AppLayout>
  );
}
