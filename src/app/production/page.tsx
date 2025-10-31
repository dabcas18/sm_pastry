'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import { Calendar, CheckCircle2, Package, Users } from 'lucide-react';

type ProductItemDetail = {
  product_id: string;
  product_name: string;
  category: string;
  quantity: number;
  pieces_per_pack: number | null;
  unit_type: string;
};

type CustomerOrder = {
  order_id: string;
  customer_name: string;
  is_production_complete: boolean;
  is_completed: boolean;
  is_paid: boolean;
  products: ProductItemDetail[];
};

type ProductSummary = {
  product_name: string;
  total_pieces: number;
};

type CategoryProductData = {
  [category: string]: ProductSummary[];
};

export default function ProductionPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [productData, setProductData] = useState<CategoryProductData>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'product' | 'customer'>('product');
  const [summary, setSummary] = useState({ incomplete: 0, completed: 0 });

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchProductionData(selectedDate);
    }
  }, [selectedDate]);

  async function fetchAvailableDates() {
    try {
      const { data: orders, error } = await supabase
        .from('Orders')
        .select('order_date, is_production_complete')
        .order('order_date', { ascending: true });

      if (error) throw error;

      const dates = Array.from(new Set(orders?.map(o => new Date(o.order_date).toISOString().split('T')[0]) || [])).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      setAvailableDates(dates);

      const dateWithIncomplete = dates.find(date => {
        return orders?.some(o =>
          new Date(o.order_date).toISOString().split('T')[0] === date && !o.is_production_complete
        );
      });

      setSelectedDate(dateWithIncomplete || dates[0] || '');
    } catch (error) {
      console.error('Error fetching dates:', error);
    }
  }

  async function fetchProductionData(date: string) {
    setLoading(true);
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('Orders')
        .select(`
          id,
          customer_name,
          is_production_complete,
          is_completed,
          is_paid,
          order_date
        `)
        .gte('order_date', `${date}T00:00:00`)
        .lt('order_date', `${date}T23:59:59`)
        .order('is_production_complete', { ascending: true });

      if (ordersError) throw ordersError;

      const orderIds = orders?.map(o => o.id) || [];
      const { data: orderItems, error: itemsError } = await supabase
        .from('OrderItems')
        .select(`
          order_id,
          quantity,
          product_id,
          Products (
            id,
            name,
            category,
            pieces_per_pack,
            unit_type
          )
        `)
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Build customer orders
      const customers: CustomerOrder[] = [];
      let incompleteCount = 0;
      let completedCount = 0;

      orders?.forEach(order => {
        if (order.is_production_complete) {
          completedCount++;
        } else {
          incompleteCount++;
        }

        const items = orderItems?.filter(item => item.order_id === order.id) || [];
        const products: ProductItemDetail[] = items.map((item: any) => ({
          product_id: item.Products?.id,
          product_name: item.Products?.name || 'Unknown',
          category: item.Products?.category || 'Others',
          quantity: item.quantity,
          pieces_per_pack: item.Products?.pieces_per_pack,
          unit_type: item.Products?.unit_type
        }));

        customers.push({
          order_id: order.id,
          customer_name: order.customer_name,
          is_production_complete: order.is_production_complete,
          is_completed: order.is_completed,
          is_paid: order.is_paid,
          products
        });
      });

      setCustomerOrders(customers);
      setSummary({ incomplete: incompleteCount, completed: completedCount });

      // Build product view (only from production incomplete orders)
      const productView: CategoryProductData = {};

      customers.forEach(customer => {
        if (customer.is_production_complete) return; // Skip production completed orders for product view

        customer.products.forEach(product => {
          const category = product.category;
          if (!productView[category]) {
            productView[category] = [];
          }

          let productSummary = productView[category].find(p => p.product_name === product.product_name);
          if (!productSummary) {
            productSummary = {
              product_name: product.product_name,
              total_pieces: 0
            };
            productView[category].push(productSummary);
          }

          // Calculate pieces
          if (product.unit_type === 'pack' && product.pieces_per_pack) {
            productSummary.total_pieces += product.quantity * product.pieces_per_pack;
          } else {
            productSummary.total_pieces += product.quantity;
          }
        });
      });

      setProductData(productView);
    } catch (error) {
      console.error('Error fetching production data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkProductionComplete(orderId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('Orders')
        .update({ is_production_complete: !currentStatus })
        .eq('id', orderId);

      if (error) throw error;

      if (selectedDate) {
        await fetchProductionData(selectedDate);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function calculatePieces(quantity: number, unitType: string, piecesPerPack: number | null): string {
    if (unitType === 'pack' && piecesPerPack) {
      const totalPieces = quantity * piecesPerPack;
      return `${quantity} pack${quantity > 1 ? 's' : ''} (${totalPieces} pcs)`;
    }
    return `${quantity} pc${quantity > 1 ? 's' : ''}`;
  }

  const categories = Object.keys(productData).sort();
  const incompleteCustomers = customerOrders.filter(c => !c.is_production_complete);
  const completedCustomers = customerOrders.filter(c => c.is_production_complete);

  return (
    <AppLayout title="Production View">
      <div className="min-h-full">
        <main className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 hidden lg:block">Production View</h1>

          {/* Date Filter */}
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

          {/* Summary */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <p className="text-xs text-orange-600 font-semibold mb-1">Incomplete Orders</p>
              <p className="text-2xl font-bold text-orange-700">{summary.incomplete}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-xs text-green-600 font-semibold mb-1">Completed Orders</p>
              <p className="text-2xl font-bold text-green-700">{summary.completed}</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setViewMode('product')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                viewMode === 'product'
                  ? 'bg-[#A9DFBF] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Package size={18} />
              Product View
            </button>
            <button
              onClick={() => setViewMode('customer')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                viewMode === 'customer'
                  ? 'bg-[#A9DFBF] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users size={18} />
              Customer View
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          ) : viewMode === 'product' ? (
            /* Product View */
            categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No incomplete orders for selected date</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-2">
                      {category}
                    </h2>
                    <div className="space-y-1">
                      {productData[category].map((product, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                          <p className="font-medium text-gray-800 text-sm">{product.product_name}</p>
                          <p className="font-bold text-[#A9DFBF] text-base">{product.total_pieces} pcs</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Customer View */
            customerOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No orders for selected date</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Incomplete Customers */}
                {incompleteCustomers.map(customer => (
                  <div key={customer.order_id} className="bg-orange-50 border border-orange-200 p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-base font-bold text-gray-800">{customer.customer_name}</h3>
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-medium ${customer.is_paid ? 'text-green-600' : 'text-orange-600'}`}>
                            {customer.is_paid ? 'Paid' : 'Unpaid'}
                          </p>
                          {customer.is_completed && (
                            <span className="text-[10px] font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                              ✓ Delivered
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleMarkProductionComplete(customer.order_id, customer.is_production_complete)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#82C3A3] text-white rounded-md font-medium text-xs hover:bg-[#6BAF8B] transition-colors"
                      >
                        <CheckCircle2 size={16} />
                        Mark as Done
                      </button>
                    </div>
                    <div className="space-y-1">
                      {customer.products.map((product, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-md">
                          <p className="text-gray-700 font-medium text-xs">{product.product_name}</p>
                          <p className="text-gray-600 font-semibold text-xs">
                            {calculatePieces(product.quantity, product.unit_type, product.pieces_per_pack)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Completed Customers */}
                {completedCustomers.map(customer => (
                  <div key={customer.order_id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg shadow-sm opacity-60">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-base font-bold text-gray-500 line-through">{customer.customer_name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-gray-500">Production Done</p>
                          {customer.is_completed && (
                            <span className="text-[10px] font-medium text-gray-500">
                              ✓ Delivered
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleMarkProductionComplete(customer.order_id, customer.is_production_complete)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-300 text-gray-600 rounded-md font-medium text-xs hover:bg-gray-400 transition-colors"
                      >
                        <CheckCircle2 size={16} />
                        Undo
                      </button>
                    </div>
                    <div className="space-y-1">
                      {customer.products.map((product, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-md">
                          <p className="text-gray-500 font-medium line-through text-xs">{product.product_name}</p>
                          <p className="text-gray-500 font-semibold text-xs">
                            {calculatePieces(product.quantity, product.unit_type, product.pieces_per_pack)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </main>
      </div>
    </AppLayout>
  );
}
