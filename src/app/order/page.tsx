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
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maribank' | 'cash'>('gcash');
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
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <Link
                href="/"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft size={18} />
              </Link>
              <h1 className="text-2xl font-bold text-brand-dark">Place Your Order</h1>
            </div>

            {/* Category Pills - Sticky */}
            <div className="sticky top-16 md:top-20 z-10 bg-brand-bg pt-2 pb-3 -mx-4 px-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 border ${
                      selectedCategory === category
                        ? 'bg-[#E8A87C] text-white border-[#E8A87C] shadow-md shadow-orange-200/50'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {/* Selected Category Title */}
              <h2 className="text-xl font-bold text-brand-dark mt-3">{selectedCategory}</h2>
            </div>

            {/* Product Cards - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map(product => {
                const cartItem = cart.find(item => item.product.id === product.id);
                return (
                  <div
                    key={product.id}
                    className="bg-brand-pink rounded-2xl p-2.5 sm:p-3 flex flex-col gap-2 sm:gap-3 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Product Image / Placeholder - Square */}
                    <div className="relative aspect-square bg-[#FFE4E4] rounded-xl overflow-hidden flex items-center justify-center">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-gray-300">
                          <ImageIcon size={28} strokeWidth={1} className="opacity-40" />
                          <span className="text-xs mt-1 opacity-50">No image</span>
                        </div>
                      )}
                      {/* Quantity Badge */}
                      {cartItem && (
                        <div className="absolute top-1.5 right-1.5 bg-brand-green text-white text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-md">
                          {cartItem.quantity}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col flex-1">
                      <p className="font-semibold text-gray-800 text-xs sm:text-sm leading-tight min-h-[2rem] sm:min-h-[2.25rem]">{product.name}</p>

                      {/* Price and Add Button Row */}
                      <div className="flex items-center justify-between mt-auto pt-1">
                        <span className="text-[#E8A87C] font-bold text-sm sm:text-base">₱{product.price.toLocaleString()}</span>

                        {cartItem ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(product.id, -1)}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"
                            >
                              <Minus size={12} className="text-gray-600" />
                            </button>
                            <span className="w-5 text-center font-semibold text-gray-800 text-xs sm:text-sm">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, 1)}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-brand-green text-white hover:bg-brand-green-dark transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="px-3 sm:px-4 py-1.5 bg-brand-green text-white text-xs sm:text-sm font-semibold rounded-full hover:bg-brand-green-dark active:scale-95 transition-all shadow-sm flex items-center gap-1"
                          >
                            <Plus size={12} />
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
                  className="w-full py-4 bg-brand-green text-white font-bold rounded-full shadow-xl shadow-brand-green/30 hover:bg-brand-green-dark transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
          <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setStep('products')}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 shadow-sm transition-colors text-brand-dark"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-2xl font-bold text-brand-dark">Complete Your Order</h1>
            </div>

            <form id="order-form" onSubmit={handleSubmit} className="space-y-4 pb-24">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-brand-dark font-bold">
                    <ShoppingCart size={18} />
                    <span>Order Summary</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('products')}
                    className="text-xs text-brand-green font-bold hover:underline"
                  >
                    + Add more
                  </button>
                </div>

                <div className="p-2">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-start gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={18} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm leading-tight break-words">{item.product.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">₱{item.product.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-brand-dark w-5 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-7 h-7 rounded-full bg-brand-green hover:bg-brand-green-dark flex items-center justify-center text-white transition-colors shadow-sm"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right w-16 shrink-0 font-bold text-brand-dark text-sm pt-0.5">
                        ₱{(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-bold text-xl text-brand-green">₱{getCartTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Your Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-4">
                <div className="flex items-center gap-2 text-brand-dark font-bold mb-4">
                  <User size={18} />
                  <span>Your Details</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 ml-1 block">Full Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all"
                      placeholder="Juan Dela Cruz"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 ml-1 block">Phone Number <span className="text-red-400">*</span></label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all"
                      placeholder="09171234567"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 ml-1 block">Email Address <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all"
                      placeholder="juan@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Date */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-4">
                <div className="flex items-center gap-2 text-brand-dark font-bold mb-1">
                  <Calendar size={18} />
                  <span>Pickup Date</span>
                </div>
                <p className="text-xs text-gray-500 mb-3 ml-6">Orders require at least 2 days to prepare.</p>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={getMinPickupDate()}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all text-gray-700 font-medium"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-4">
                <div className="flex items-center gap-2 text-brand-dark font-bold mb-1">
                  <CreditCard size={18} />
                  <span>Payment Method</span>
                </div>
                <p className="text-xs text-gray-500 mb-4 ml-6">
                  {paymentMethod === 'cash' ? 'Pay when you pick up your order.' : 'QR codes will be shown after placing order.'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gcash')}
                    className={`p-3 rounded-xl border-2 transition-all font-bold text-base ${
                      paymentMethod === 'gcash'
                        ? 'border-[#007DFE] bg-[#E8F3FF] text-[#007DFE]'
                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    GCash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('maribank')}
                    className={`p-3 rounded-xl border-2 transition-all font-bold text-base ${
                      paymentMethod === 'maribank'
                        ? 'border-[#F57C00] bg-[#FFF3E0] text-[#F57C00]'
                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    MariBank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border-2 transition-all font-bold text-base ${
                      paymentMethod === 'cash'
                        ? 'border-[#82C3A3] bg-[#E8F5EC] text-[#82C3A3]'
                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    Cash
                  </button>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-4">
                <div className="flex items-center gap-2 text-brand-dark font-bold mb-3">
                  <FileText size={18} />
                  <span>Order Notes</span>
                  <span className="text-gray-400 font-normal text-sm">(Optional)</span>
                </div>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all min-h-[100px] resize-none"
                  placeholder="Any special requests? (e.g., no nuts, for birthday)"
                />
              </div>
            </form>

            {/* Sticky Submit Button */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-brand-bg via-brand-bg to-transparent z-40">
              <div className="max-w-4xl mx-auto">
                <button
                  type="submit"
                  form="order-form"
                  disabled={loading || cart.length === 0}
                  className="w-full py-4 bg-brand-green text-white font-bold rounded-full shadow-xl shadow-brand-green/30 hover:bg-brand-green-dark transition-all active:scale-[0.99] disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : `Place Order - ₱${getCartTotal().toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
