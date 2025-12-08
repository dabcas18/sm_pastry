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
  payment_method: string;
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
  { key: 'pending', label: 'Order Placed', icon: Package, description: 'Waiting for payment confirmation', descriptionCash: 'Waiting for order confirmation' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Order is being prepared', descriptionCash: 'Order is being prepared' },
  { key: 'ready', label: 'Ready for Pickup', icon: Truck, description: 'You can now book a courier', descriptionCash: 'You can now book a courier' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, description: 'Order has been picked up', descriptionCash: 'Order has been picked up' },
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
    <div className="min-h-screen bg-brand-bg">
      <Header />

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-brand-dark">Track Your Order</h1>
        </div>

        {/* Search Form - Collapsible */}
        {showSearchForm ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4 animate-fade-in">
            {/* Empty state illustration */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-3">
                <Package className="text-brand-green" size={28} />
              </div>
              <p className="text-gray-500 font-medium text-sm">Enter your details to track your order</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1.5 ml-1">
                  Order Number
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/50 uppercase text-center font-medium text-gray-700 tracking-wide placeholder-gray-300"
                  placeholder="JOH-A1B2C3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1.5 ml-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/50 text-center font-medium text-gray-700 tracking-wide placeholder-gray-300"
                  placeholder="09XXXXXXXXX"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green-dark transition-all disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-lg shadow-brand-green/20 active:scale-[0.98] mt-2"
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
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 mb-4">
            {/* Horizontal Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-1.5">
                <span>Progress</span>
                <span className="font-bold text-brand-dark">{Math.round(((getStatusIndex(order) + 1) / STATUS_STEPS.length) * 100)}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-green rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${((getStatusIndex(order) + 1) / STATUS_STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Order info row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-brand-green rounded-full flex items-center justify-center shadow-md">
                  <Package className="text-white" size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg text-brand-dark tracking-wide">{order.order_number}</p>
                    <button
                      onClick={copyOrderNumber}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy order number"
                    >
                      {copied ? (
                        <CheckCircle size={14} className="text-brand-green" />
                      ) : (
                        <Copy size={14} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">{order.customer_name}</p>
                </div>
              </div>
              <button
                onClick={handleSearchAgain}
                className="text-sm text-gray-400 hover:text-brand-dark font-medium underline-offset-4 hover:underline transition-colors"
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

            {/* Status Timeline */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 mb-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-brand-dark">Status</h2>
                {order.payment_method === 'cash' && (
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Cash Payment</span>
                )}
              </div>
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[17px] top-4 bottom-4 w-0.5 bg-gray-100"></div>

                {/* Steps */}
                <div className="space-y-5 relative z-10">
                  {STATUS_STEPS.map((step, index) => {
                    const currentIndex = getStatusIndex(order);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const Icon = step.icon;
                    const isCash = order.payment_method === 'cash';

                    return (
                      <div key={step.key} className="flex gap-4">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${
                            isCompleted
                              ? 'bg-green-50 text-brand-green'
                              : 'bg-gray-50 text-gray-300'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className={`${isCurrent ? '' : 'opacity-40'}`}>
                          <p className={`font-bold ${isCompleted ? 'text-brand-dark' : 'text-gray-500'}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-gray-400 mt-0.5">{isCash ? step.descriptionCash : step.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 mb-4">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Number</p>
                  <p className="text-lg font-bold text-brand-green">{order.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Pickup Date</p>
                  <p className="font-bold text-brand-dark">{formatDate(order.pickup_date)}</p>
                </div>
              </div>

              <h3 className="font-bold text-brand-dark mb-3">Order Items</h3>
              <div className="space-y-2">
                {orderItems.map(item => (
                  <div key={item.id} className="flex justify-between items-start py-1.5">
                    <div>
                      <p className="font-medium text-gray-700 text-sm">{item.product?.name || 'Product'}</p>
                      <p className="text-xs text-gray-400">₱{Number(item.unit_price).toLocaleString()} × {item.quantity}</p>
                    </div>
                    <p className="font-bold text-brand-dark text-sm">₱{Number(item.subtotal).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-brand-dark">Total</span>
                <span className="font-bold text-brand-green text-lg">₱{Number(order.total_amount).toLocaleString()}</span>
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
