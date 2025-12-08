'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Copy, ExternalLink, Instagram, Download, Calendar, Clock } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  email: string;
  phone_number: string;
  total_amount: number;
  payment_method: string;
  pickup_date: string;
  order_notes: string | null;
  status: string;
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

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  async function fetchOrder() {
    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('Orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      // Fetch order items with product names
      const { data: itemsData, error: itemsError } = await supabase
        .from('OrderItems')
        .select(`
          id,
          quantity,
          unit_price,
          subtotal,
          product:Products(name)
        `)
        .eq('order_id', orderData.id);

      if (itemsError) throw itemsError;
      setOrderItems(itemsData as unknown as OrderItem[]);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }

  const copyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveQRCode = async () => {
    const qrImage = order?.payment_method === 'gcash' ? '/gcash-qr.jpg' : '/maribank-qr.jpg';
    try {
      const response = await fetch(qrImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${order?.payment_method}-qr-code.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving QR code:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link href="/order" className="text-brand-green font-medium hover:underline">
            Place a new order
          </Link>
        </div>
      </div>
    );
  }

  const isCash = order.payment_method === 'cash';
  const qrImage = order.payment_method === 'gcash' ? '/gcash-qr.jpg' : '/maribank-qr.jpg';
  const paymentMethodName = order.payment_method === 'gcash' ? 'GCash' : order.payment_method === 'maribank' ? 'MariBank' : 'Cash';
  const paymentColor = order.payment_method === 'gcash' ? '#007DFE' : order.payment_method === 'maribank' ? '#F26522' : '#82C3A3';

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-4 animate-fade-in">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-sm border-4 border-white">
            <Check className="w-8 h-8 text-brand-green" strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-bold text-brand-dark">Thank you, {order.customer_name.split(' ')[0]}!</h1>
          <p className="text-gray-500 text-sm">
            Your order has been placed successfully<br />
            <span className="text-xs">Confirmation sent to {order.email}</span>
          </p>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          {/* Green Header */}
          <div className="bg-brand-green p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Order Number</p>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">{order.order_number}</h2>
                <button onClick={copyOrderNumber} className="text-white/70 hover:text-white transition-colors">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="text-white sm:text-right">
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Pickup Date</p>
              <div className="flex items-center gap-1.5 text-white font-medium text-sm">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(order.pickup_date)}</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-4">
            <h3 className="font-bold text-brand-dark mb-3">Order Summary</h3>
            <div className="space-y-2">
              {orderItems.map(item => (
                <div key={item.id} className="flex justify-between items-start py-1.5 border-b border-dashed border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-700 text-sm">{item.product?.name || 'Product'}</p>
                    <p className="text-xs text-gray-400">₱{Number(item.unit_price).toLocaleString()} × {item.quantity}</p>
                  </div>
                  <p className="font-bold text-brand-dark text-sm">₱{Number(item.subtotal).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
              <h3 className="font-bold text-brand-dark">Total</h3>
              <h3 className="font-bold text-brand-green text-lg">₱{Number(order.total_amount).toLocaleString()}</h3>
            </div>
            {order.order_notes && (
              <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                <strong>Notes:</strong> {order.order_notes}
              </p>
            )}
          </div>
        </div>

        {/* Payment Section */}
        {isCash ? (
          <div className="rounded-2xl p-4 text-center bg-[#E8F5EC] border border-[#A9DFBF]">
            <h3 className="font-bold mb-2 text-brand-green">Cash Payment</h3>
            <p className="text-green-700 text-sm mb-3">Pay when you pick up your order</p>
            <p className="font-bold text-2xl text-brand-green">₱{Number(order.total_amount).toLocaleString()}</p>
          </div>
        ) : (
          <div
            className="rounded-2xl p-4 text-center relative overflow-hidden"
            style={{ backgroundColor: order.payment_method === 'gcash' ? '#EBF5FF' : '#FFF8E1', borderColor: order.payment_method === 'gcash' ? '#90CAF9' : '#FFE082', borderWidth: '1px' }}
          >
            <h3 className="font-bold mb-3" style={{ color: paymentColor }}>Payment via {paymentMethodName}</h3>
            <div className="bg-white p-3 rounded-xl shadow-sm inline-block mb-3">
              <Image
                src={qrImage}
                alt={`${paymentMethodName} QR Code`}
                width={180}
                height={180}
                className="rounded-lg"
              />
            </div>
            <p className="font-bold text-xl mb-3" style={{ color: paymentColor }}>₱{Number(order.total_amount).toLocaleString()}</p>
            <button
              onClick={saveQRCode}
              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold text-sm shadow-lg mx-auto transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: paymentColor }}
            >
              <Download size={16} />
              Save QR Code
            </button>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <h3 className="font-bold text-green-800 mb-3">Next Steps</h3>
          {isCash ? (
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <div className="space-y-2">
                  <p className="text-green-800 text-sm">Message us on Instagram to confirm your order</p>
                  <a
                    href="https://ig.me/m/bysistersandmom"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
                  >
                    <Instagram className="w-4 h-4" />
                    Message @bysistersandmom
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <p className="text-green-800 text-sm">Pick up your order on the scheduled date</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                <p className="text-green-800 text-sm">Pay ₱{Number(order.total_amount).toLocaleString()} in cash upon pickup</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <p className="text-green-800 text-sm">Pay using the QR code above</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <p className="text-green-800 text-sm">Screenshot your payment receipt</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                <div className="space-y-2">
                  <p className="text-green-800 text-sm">Send screenshot + order number to Instagram</p>
                  <a
                    href="https://ig.me/m/bysistersandmom"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
                  >
                    <Instagram className="w-4 h-4" />
                    Message @bysistersandmom
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
                <p className="text-green-800 text-sm">Wait for our confirmation message</p>
              </div>
            </div>
          )}
          <div className="mt-4 bg-green-100/50 rounded-lg p-2.5 text-green-700 text-xs font-medium text-center flex items-center justify-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            We usually confirm within 1-2 hours (9 AM - 6 PM)
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center space-y-3 pt-2">
          <Link
            href={`/track?orderNumber=${order.order_number}&phone=${order.phone_number}`}
            className="inline-block px-10 py-3.5 bg-brand-green text-white font-bold rounded-xl shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark transition-all hover:-translate-y-0.5"
          >
            Track Your Order
          </Link>
          <p className="text-gray-400 text-sm">
            Or visit <Link href="/track" className="text-brand-green hover:underline">/track</Link> anytime
          </p>
        </div>

        {/* Social Promo */}
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-50">
          <p className="text-gray-600 text-sm mb-3">Follow us for updates and new products!</p>
          <a
            href="https://www.instagram.com/bysistersandmom/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-lg text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
          >
            <Instagram className="w-4 h-4" />
            Follow @bysistersandmom
          </a>
        </div>
      </main>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#82C3A3] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
