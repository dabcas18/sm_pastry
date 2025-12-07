'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Copy, Check, ExternalLink, Instagram, Download, Calendar } from 'lucide-react';
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
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#82C3A3] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link href="/order" className="text-[#82C3A3] font-medium hover:underline">
            Place a new order
          </Link>
        </div>
      </div>
    );
  }

  const qrImage = order.payment_method === 'gcash' ? '/gcash-qr.jpg' : '/maribank-qr.jpg';
  const paymentMethodName = order.payment_method === 'gcash' ? 'GCash' : 'MariBank';

  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Success Message - Personalized */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank you, {order.customer_name.split(' ')[0]}!</h1>
          <p className="text-gray-600">Your order has been placed successfully</p>
          <p className="text-sm text-gray-500 mt-1">Confirmation sent to {order.email}</p>
        </div>

        {/* Order Number + Pickup Date Card */}
        <div className="bg-[#82C3A3] text-white rounded-xl p-5 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs opacity-80 mb-1">Order Number</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-wider">{order.order_number}</span>
                <button
                  onClick={copyOrderNumber}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Copy order number"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80 mb-1">Pickup Date</p>
              <div className="flex items-center gap-2 justify-end">
                <Calendar size={16} className="opacity-80" />
                <span className="font-semibold">{formatDate(order.pickup_date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Order Summary</h2>
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
          {order.order_notes && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
              <p><strong>Notes:</strong> {order.order_notes}</p>
            </div>
          )}
        </div>

        {/* Payment QR Code */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-amber-800 mb-3">Payment via {paymentMethodName}</h2>
          <div className="flex flex-col items-center">
            <Image
              src={qrImage}
              alt={`${paymentMethodName} QR Code`}
              width={220}
              height={220}
              className="rounded-lg mb-3"
            />
            <p className="text-amber-800 font-bold text-lg mb-3">Amount: ₱{Number(order.total_amount).toLocaleString()}</p>
            <button
              onClick={saveQRCode}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
            >
              <Download size={16} />
              Save QR Code
            </button>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-green-800 mb-3">Next Steps</h2>
          <ol className="space-y-3 text-green-800">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Pay using the QR code above</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Take a screenshot of your payment receipt</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <div>
                <span>Send screenshot + order number to our Instagram</span>
                <a
                  href="https://ig.me/m/bysistersandmom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all w-fit"
                >
                  <Instagram size={18} />
                  <span>Message @bysistersandmom</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>Wait for our confirmation message</span>
            </li>
          </ol>
          <p className="mt-4 text-sm text-green-700 bg-green-100 rounded-lg px-3 py-2">
            We usually confirm payments within 1-2 hours during business hours (9 AM - 6 PM)
          </p>
        </div>

        {/* Track Order Link */}
        <div className="text-center space-y-3 mb-6">
          <Link
            href={`/track?orderNumber=${order.order_number}&phone=${order.phone_number}`}
            className="inline-block px-6 py-3 bg-[#82C3A3] text-white font-semibold rounded-xl hover:bg-[#6BAF8B] transition-colors"
          >
            Track Your Order
          </Link>
          <p className="text-sm text-gray-500">
            Or visit <Link href="/track" className="text-[#82C3A3] hover:underline">/track</Link> anytime
          </p>
        </div>

        {/* Instagram Follow Prompt */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-gray-600 text-sm mb-3">Follow us for updates and new products!</p>
          <a
            href="https://www.instagram.com/bysistersandmom/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Instagram size={18} />
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
