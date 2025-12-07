'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus, ShoppingCart, Trash2, ArrowLeft, ImageIcon, User, Calendar, CreditCard, FileText } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string;
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maribank'>('gcash');
  const [pickupDate, setPickupDate] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Get minimum pickup date (2 days from now, or 3 days if after 8 PM Philippine time)
  const getMinPickupDate = () => {
    // Get current time in Philippine timezone
    const now = new Date();
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const currentHour = phTime.getHours();

    // If after 8 PM (20:00), add 3 days instead of 2
    const daysToAdd = currentHour >= 20 ? 3 : 2;

    const minDate = new Date(phTime);
    minDate.setDate(minDate.getDate() + daysToAdd);

    // Format as YYYY-MM-DD using local values
    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, '0');
    const day = String(minDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchProducts();
    setPickupDate(getMinPickupDate());
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('Products')
      .select('id, name, price, category, image_url')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    setProducts(data || []);
    // Set first category as selected by default
    if (data && data.length > 0) {
      const categories = [...new Set(data.map(p => p.category))];
      setSelectedCategory(categories[0]);
    }
  }

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))];

  // Get products for selected category
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

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
          // If new quantity is 0 or less, mark for removal
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0); // Remove items with 0 quantity
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
      <Header rightContent={
        step === 'products' && cart.length > 0 ? (
          <button
            onClick={() => setStep('details')}
            className="flex items-center gap-2 px-4 py-2 bg-[#82C3A3] text-white rounded-lg hover:bg-[#6BAF8B] transition-colors"
          >
            <ShoppingCart size={18} />
            <span className="font-medium">{getCartCount()}</span>
            <span className="hidden sm:inline">- ₱{getCartTotal().toLocaleString()}</span>
          </button>
        ) : undefined
      } />

      <main className="container mx-auto px-4 py-4 max-w-4xl">
        {step === 'products' ? (
          <>
            {/* Title with back button */}
            <div className="flex items-center gap-2 mb-3">
              <Link
                href="/"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
              >
                <ArrowLeft size={16} />
              </Link>
              <h1 className="text-xl font-bold text-gray-800">Place Your Order</h1>
            </div>

            {/* Category Pills - Sticky */}
            <div className="sticky top-0 z-10 bg-[#FFF8F5] pt-2 pb-4 -mx-4 px-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-[#E8A87C] text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#E8A87C] hover:text-[#E8A87C]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {/* Selected Category Title */}
              <h2 className="text-lg font-semibold text-gray-700 mt-2">{selectedCategory}</h2>
            </div>

            {/* Product Cards - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map(product => {
                const cartItem = cart.find(item => item.product.id === product.id);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-transform hover:scale-[1.02]"
                  >
                    {/* Product Image / Placeholder */}
                    <div className="relative h-32 sm:h-40 lg:h-44 bg-gradient-to-br from-[#FFF8F5] to-[#FADBD8] flex items-center justify-center">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-gray-300">
                          <ImageIcon size={32} strokeWidth={1} className="sm:w-10 sm:h-10" />
                          <span className="text-xs mt-1">No image</span>
                        </div>
                      )}
                      {/* Quantity Badge */}
                      {cartItem && (
                        <div className="absolute top-2 right-2 bg-[#82C3A3] text-white text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow">
                          {cartItem.quantity}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-2 sm:p-3">
                      <p className="font-medium text-gray-800 text-xs sm:text-sm leading-tight min-h-[2rem] sm:min-h-[2.5rem]">{product.name}</p>
                      <p className="text-[#E8A87C] font-bold mt-1 text-right text-sm sm:text-base">₱{product.price.toLocaleString()}</p>

                      {/* Add / Quantity Controls */}
                      <div className="mt-2 sm:mt-3">
                        {cartItem ? (
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(product.id, -1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white shadow-sm hover:bg-gray-100 transition-colors"
                            >
                              <Minus size={14} className="text-gray-600 sm:w-4 sm:h-4" />
                            </button>
                            <span className="font-semibold text-gray-800 text-sm">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-[#82C3A3] text-white hover:bg-[#6BAF8B] transition-colors"
                            >
                              <Plus size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full py-1.5 sm:py-2 bg-[#82C3A3] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#6BAF8B] transition-colors flex items-center justify-center gap-1"
                          >
                            <Plus size={14} className="sm:w-4 sm:h-4" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
              <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto">
                <button
                  onClick={() => setStep('details')}
                  className="w-full py-4 bg-[#82C3A3] text-white font-semibold rounded-xl shadow-lg hover:bg-[#6BAF8B] transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  <span>View Cart ({getCartCount()}) - ₱{getCartTotal().toLocaleString()}</span>
                </button>
              </div>
            )}

            {/* Spacer for floating button */}
            {cart.length > 0 && <div className="h-20" />}
          </>
        ) : (
          <>
            {/* Title with back button */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setStep('products')}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
              >
                <ArrowLeft size={16} />
              </button>
              <h1 className="text-xl font-bold text-gray-800">Complete Your Order</h1>
            </div>

            <form id="order-form" onSubmit={handleSubmit} className="space-y-4 pb-24">
              {/* Cart Summary */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} className="text-gray-500" />
                    <h2 className="font-semibold text-gray-800">Order Summary</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('products')}
                    className="text-sm text-[#82C3A3] hover:underline"
                  >
                    + Add more
                  </button>
                </div>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
                      {/* Product Thumbnail */}
                      <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-[#FFF8F5] to-[#FADBD8] flex items-center justify-center overflow-hidden">
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <ImageIcon size={16} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-gray-800 text-xs leading-tight">{item.product.name}</p>
                        <p className="text-xs text-gray-400">₱{item.product.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Minus size={12} className="text-gray-600" />
                        </button>
                        <span className="w-5 text-center font-semibold text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-[#82C3A3] hover:bg-[#6BAF8B] transition-colors"
                        >
                          <Plus size={12} className="text-white" />
                        </button>
                      </div>
                      <p className="font-semibold text-gray-800 text-xs w-12 text-right">₱{(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-[#82C3A3]">₱{getCartTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <User size={18} className="text-gray-500" />
                  <h2 className="font-semibold text-gray-800">Your Details</h2>
                </div>
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
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={18} className="text-gray-500" />
                  <h2 className="font-semibold text-gray-800">Pickup Date</h2>
                </div>
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
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard size={18} className="text-gray-500" />
                  <h2 className="font-semibold text-gray-800">Payment Method</h2>
                </div>
                <p className="text-sm text-gray-500 mb-3">Select how you will pay. QR codes will be shown after placing order.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gcash')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'gcash'
                        ? 'border-[#007DFE] bg-[#007DFE]/10'
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
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-gray-500" />
                  <h2 className="font-semibold text-gray-800">Order Notes <span className="font-normal text-gray-400">(Optional)</span></h2>
                </div>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82C3A3] focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Any special requests? (e.g., no nuts, for birthday)"
                />
              </div>

            </form>

            {/* Sticky Submit Button */}
            <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto">
              <button
                type="submit"
                form="order-form"
                disabled={loading || cart.length === 0}
                className="w-full py-4 bg-[#82C3A3] text-white font-semibold rounded-xl shadow-lg hover:bg-[#6BAF8B] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Placing Order...' : `Place Order - ₱${getCartTotal().toLocaleString()}`}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
