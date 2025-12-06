'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function CustomerOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'products' | 'details'>('products');

  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maribank'>('gcash');
  const [pickupDate, setPickupDate] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Get minimum pickup date (2 days from now)
  const getMinPickupDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchProducts();
    setPickupDate(getMinPickupDate());
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('Products')
      .select('id, name, price, category')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    setProducts(data || []);
  }

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Please add items to your cart');
      return;
    }

    if (!customerName.trim() || !phone.trim() || !email.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create order via API
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          paymentMethod,
          pickupDate,
          orderNotes: orderNotes.trim(),
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price,
            subtotal: item.product.price * item.quantity
          })),
          totalAmount: getCartTotal()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Redirect to confirmation page
      router.push(`/order/confirmation?orderNumber=${data.orderNumber}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="Sisters & Mom"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-bold text-gray-800">Sisters & Mom</span>
          </Link>

          {step === 'products' && cart.length > 0 && (
            <button
              onClick={() => setStep('details')}
              className="flex items-center gap-2 px-4 py-2 bg-[#82C3A3] text-white rounded-lg hover:bg-[#6BAF8B] transition-colors"
            >
              <ShoppingCart size={18} />
              <span className="font-medium">{getCartCount()}</span>
              <span className="hidden sm:inline">- ₱{getCartTotal().toLocaleString()}</span>
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {step === 'products' ? (
          <>
            {/* Back to home */}
            <Link href="/" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 mb-4">
              <ArrowLeft size={18} />
              <span>Back to home</span>
            </Link>

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Place Your Order</h1>

            {/* Products by Category */}
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category} className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3 px-1">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryProducts.map(product => {
                    const cartItem = cart.find(item => item.product.id === product.id);
                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex justify-between items-center"
                      >
                        <div className="flex-grow">
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-[#82C3A3] font-semibold">₱{product.price.toLocaleString()}</p>
                        </div>

                        {cartItem ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(product.id, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-medium">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#82C3A3] text-white hover:bg-[#6BAF8B] transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="px-4 py-2 bg-[#82C3A3] text-white text-sm font-medium rounded-lg hover:bg-[#6BAF8B] transition-colors"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Floating Cart Button (Mobile) */}
            {cart.length > 0 && (
              <div className="fixed bottom-4 left-4 right-4 sm:hidden">
                <button
                  onClick={() => setStep('details')}
                  className="w-full py-4 bg-[#82C3A3] text-white font-semibold rounded-xl shadow-lg hover:bg-[#6BAF8B] transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  <span>View Cart ({getCartCount()}) - ₱{getCartTotal().toLocaleString()}</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Back to products */}
            <button
              onClick={() => setStep('products')}
              className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft size={18} />
              <span>Back to products</span>
            </button>

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Order</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cart Summary */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-3">Order Summary</h2>
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-grow">
                        <p className="font-medium text-gray-800">{item.product.name}</p>
                        <p className="text-sm text-gray-500">₱{item.product.price.toLocaleString()} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-gray-800">₱{(item.product.price * item.quantity).toLocaleString()}</p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-[#82C3A3]">₱{getCartTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-3">Your Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82C3A3] focus:border-transparent"
                      placeholder="Juan Dela Cruz"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82C3A3] focus:border-transparent"
                      placeholder="09171234567"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82C3A3] focus:border-transparent"
                      placeholder="juan@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Date */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-3">Pickup Date</h2>
                <p className="text-sm text-gray-500 mb-3">Orders require at least 2 days to prepare.</p>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={getMinPickupDate()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82C3A3] focus:border-transparent"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-3">Payment Method</h2>
                <p className="text-sm text-gray-500 mb-3">Select how you will pay. QR codes will be shown after placing order.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gcash')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'gcash'
                        ? 'border-[#007DFE] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-[#007DFE]">GCash</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('maribank')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'maribank'
                        ? 'border-[#F26522] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-[#F26522]">MariBank</p>
                  </button>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-3">Order Notes (Optional)</h2>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82C3A3] focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Any special requests? (e.g., no nuts, for birthday)"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full py-4 bg-[#82C3A3] text-white font-semibold rounded-xl shadow-lg hover:bg-[#6BAF8B] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Placing Order...' : `Place Order - ₱${getCartTotal().toLocaleString()}`}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
