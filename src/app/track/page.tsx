'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Package, Clock, CheckCircle, Truck, ArrowLeft, Copy, MessageCircle } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone_number: string;
  total_amount: number;
  pickup_date: string;
  status: string;
  is_paid: boolean;
  is_production_complete: boolean;
  is_completed: boolean;
  created_at: string;
};

type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product: {
    name: string;
  };
};

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package, description: 'Waiting for payment confirmation' },
  { key: 'confirmed', label: 'Payment Confirmed', icon: CheckCircle, description: 'Order is being prepared' },
  { key: 'ready', label: 'Ready for Pickup', icon: Truck, description: 'You can now book a courier' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, description: 'Order has been picked up' },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [autoFetched, setAutoFetched] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Auto-fetch order if both orderNumber and phone are in URL (from email link)
  useEffect(() => {
    if (initialOrderNumber && initialPhone && !autoFetched) {
      setAutoFetched(true);
      fetchOrder(initialOrderNumber, initialPhone);
    }
  }, [initialOrderNumber, initialPhone, autoFetched]);

  // Fetch order function (extracted for reuse)
  async function fetchOrder(orderNum: string, phoneNum: string) {
    setError('');
    setSearched(true);
    setLoading(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('Orders')
        .select('*')
        .eq('order_number', orderNum.trim().toUpperCase())
        .eq('phone_number', phoneNum.trim())
        .single();

      if (orderError || !orderData) {
        setError('Order not found. Please check your order number and phone number.');
        setOrder(null);
        setOrderItems([]);
        return;
      }

      setOrder(orderData);
      setShowSearchForm(false);

      const { data: itemsData } = await supabase
        .from('OrderItems')
        .select(`
          id,
          quantity,
          unit_price,
          subtotal,
          product:Products(name)
        `)
        .eq('order_id', orderData.id);

      setOrderItems(itemsData as unknown as OrderItem[] || []);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Supabase Realtime subscription for order updates
  useEffect(() => {
    if (!order || order.is_completed) return;

    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Orders',
          filter: `id=eq.${order.id}`
        },
        (payload) => {
          setOrder(payload.new as Order);
          setLastUpdated(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id, order?.is_completed]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim() || !phone.trim()) {
      setError('Please enter both order number and phone number');
      return;
    }

    fetchOrder(orderNumber, phone);
  };

  // Phone number input handler - only allow numbers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value);
  };

  // Reset search to track different order
  const handleSearchAgain = () => {
    setShowSearchForm(true);
    setOrder(null);
    setOrderItems([]);
    setOrderNumber('');
    setPhone('');
    setSearched(false);
    setError('');
  };

  const getStatusIndex = (order: Order) => {
    if (order.is_completed) return 3;
    if (order.status === 'ready') return 2;
    if (order.status === 'confirmed' || order.is_paid) return 1;
    return 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      <Header />

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Track Your Order</h1>
        </div>

        {/* Search Form - Collapsible */}
        {showSearchForm ? (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            {/* Empty state illustration */}
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-[#82C3A3]/10 rounded-full flex items-center justify-center mb-3">
                <Package className="text-[#82C3A3]" size={32} />
              </div>
              <p className="text-gray-600 text-sm">Enter your details to track your order</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82C3A3] focus:border-transparent uppercase text-center font-mono text-lg"
                  placeholder="JOH-A1B2C3"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82C3A3] focus:border-transparent text-center text-lg"
                  placeholder="09XXXXXXXXX"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#82C3A3] text-white font-semibold rounded-xl hover:bg-[#6BAF8B] transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Searching...</span>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Track Order</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : order && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
            {/* Horizontal Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(((getStatusIndex(order) + 1) / STATUS_STEPS.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#82C3A3] rounded-full transition-all duration-500"
                  style={{ width: `${((getStatusIndex(order) + 1) / STATUS_STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Order info row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#82C3A3] rounded-full flex items-center justify-center">
                  <Package className="text-white" size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">{order.order_number}</p>
                    <button
                      onClick={copyOrderNumber}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy order number"
                    >
                      {copied ? (
                        <CheckCircle size={14} className="text-[#82C3A3]" />
                      ) : (
                        <Copy size={14} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">{order.customer_name}</p>
                </div>
              </div>
              <button
                onClick={handleSearchAgain}
                className="text-xs text-gray-400 hover:text-[#82C3A3] transition-colors"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Order Details */}
        {order && (
          <>
            {/* Live updates indicator */}
            {!order.is_completed && (
              <div className="text-center text-xs text-gray-400 mb-2 flex items-center justify-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Live updates enabled</span>
                {lastUpdated && <span> • Updated: {lastUpdated.toLocaleTimeString()}</span>}
              </div>
            )}

            {/* Status Timeline - Compact */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
              <h2 className="font-semibold text-gray-800 mb-3 text-sm">Status</h2>
              <div className="space-y-0">
                {STATUS_STEPS.map((step, index) => {
                  const currentIndex = getStatusIndex(order);
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? 'bg-[#82C3A3] text-white'
                              : 'bg-gray-100 text-gray-400'
                          } ${isCurrent ? 'ring-2 ring-[#82C3A3]/30' : ''}`}
                        >
                          <Icon size={16} />
                        </div>
                        {index < STATUS_STEPS.length - 1 && (
                          <div
                            className={`w-0.5 h-6 ${
                              index < currentIndex ? 'bg-[#82C3A3]' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>
                      <div className={`flex-grow pb-3 ${isCurrent ? '' : 'opacity-50'}`}>
                        <p className={`text-sm font-medium ${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-gray-400">{step.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="flex-shrink-0">
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="text-xl font-bold text-[#82C3A3] whitespace-nowrap">{order.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Pickup Date</p>
                  <p className="font-medium text-gray-800">{formatDate(order.pickup_date)}</p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-800 mb-2">Order Items</h3>
              <div className="space-y-2">
                {orderItems.map(item => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{item.product?.name || 'Product'}</p>
                      <p className="text-sm text-gray-500">₱{Number(item.unit_price).toLocaleString()} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800">₱{Number(item.subtotal).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-lg font-bold text-[#82C3A3]">₱{Number(order.total_amount).toLocaleString()}</span>
              </div>
            </div>

            {/* Ready for Pickup Instructions */}
            {order.status === 'ready' && !order.is_completed && (
              <div className="bg-[#82C3A3]/10 border border-[#82C3A3] rounded-xl p-4 mb-6">
                <h2 className="font-semibold text-[#1B4332] mb-3">Ready for Pickup!</h2>
                <p className="text-[#2D6A4F] mb-3">Your order is ready. Please book a courier (Grab/Maxim) with these details:</p>
                <ul className="text-[#2D6A4F] space-y-1">
                  <li><strong>Shop Address:</strong> Blk 13 Lot 14 Dahlia St. Pineda Subdivision, Dau, Mabalacat Pampanga, Philippines 2010</li>
                  <li><strong>Contact Number:</strong> 0917-815-8007</li>
                  <li><strong>Order Number:</strong> {order.order_number}</li>
                </ul>
              </div>
            )}

            {/* Help/Contact Link */}
            <div className="text-center">
              <a
                href="https://ig.me/m/bysistersandmom"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-[#82C3A3] transition-colors text-sm"
              >
                <MessageCircle size={16} />
                <span>Need help? DM us on Instagram</span>
              </a>
            </div>
          </>
        )}

        {/* No Results */}
        {searched && !order && !loading && !error && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Enter your order number and phone number to track your order</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#82C3A3] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
