'use client';

import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import Toast from '@/components/Toast';
import CustomSelect from '@/components/CustomSelect';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

type OrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export default function OrderFormPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  // Get current date in Philippine timezone
  const getPhilippineDate = () => {
    const now = new Date();
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const year = phTime.getFullYear();
    const month = String(phTime.getMonth() + 1).padStart(2, '0');
    const day = String(phTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [orderDate, setOrderDate] = useState(getPhilippineDate());
  const [pickupDate, setPickupDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maribank'>('gcash');
  const [sendEmail, setSendEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Get minimum pickup date (2 days from now, or 3 days if after 8 PM Philippine time)
  const getMinPickupDate = () => {
    const now = new Date();
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const currentHour = phTime.getHours();
    const daysToAdd = currentHour >= 20 ? 3 : 2;
    const minDate = new Date(phTime);
    minDate.setDate(minDate.getDate() + daysToAdd);
    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, '0');
    const day = String(minDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Phone number handler - only allow numbers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value);
  };

  useEffect(() => {
    fetchProducts();
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

    // Set default category to first available
    if (data && data.length > 0) {
      const firstCategory = data[0].category;
      setSelectedCategory(firstCategory);

      // Set default product to first in that category
      const firstProduct = data.find(p => p.category === firstCategory);
      if (firstProduct) {
        setSelectedProductId(firstProduct.id);
      }
    }
  }

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category))).sort();

  // Filter products based on selected category
  const filteredProducts = products.filter(p => p.category === selectedCategory);

  // When category changes, select first product in that category
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const firstProductInCategory = products.find(p => p.category === category);
    if (firstProductInCategory) {
      setSelectedProductId(firstProductInCategory.id);
    }
  };

  function handleAddItem() {
    const product = products.find(p => p.id === selectedProductId);
    const qty = typeof quantity === 'number' ? quantity : parseInt(String(quantity)) || 1;

    if (!product || qty <= 0) return;

    const subtotal = product.price * qty;
    const newItem: OrderItem = {
      product_id: product.id,
      product_name: product.name,
      quantity: qty,
      unit_price: product.price,
      subtotal
    };

    setOrderItems([...orderItems, newItem]);
    setQuantity(1);
    setShowToast(true);
  }

  function handleRemoveItem(index: number) {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  }

  function calculateTotal() {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  function handleQuantityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value === '') {
      setQuantity('');
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setQuantity(numValue);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    if (orderItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    // If sending email, require email and phone
    if (sendEmail && (!email.trim() || !phone.trim())) {
      alert('Email and phone number are required to send confirmation email');
      return;
    }

    setLoading(true);

    try {
      // If sending email, use the API endpoint
      if (sendEmail && email.trim()) {
        const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customerName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            paymentMethod,
            pickupDate: pickupDate || null,
            orderNotes: '',
            items: orderItems.map(item => ({
              productId: item.product_id,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              subtotal: item.subtotal
            })),
            totalAmount: calculateTotal()
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create order');
        }
      } else {
        // Create order directly without email
        const { data: order, error: orderError } = await supabase
          .from('Orders')
          .insert({
            customer_name: customerName,
            phone_number: phone || null,
            email: email || null,
            order_date: orderDate,
            pickup_date: pickupDate || null,
            payment_method: paymentMethod,
            total_amount: calculateTotal(),
            status: 'pending',
            is_paid: false,
            is_completed: false,
            is_production_complete: false
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItemsData = orderItems.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal
        }));

        const { error: itemsError } = await supabase
          .from('OrderItems')
          .insert(orderItemsData);

        if (itemsError) throw itemsError;
      }

      // Success - redirect to orders page
      router.push('/orders');
      router.refresh();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title="Create Order">
      <div className="min-h-full">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#FFF8F5] pt-6 pb-4 px-6">
          <h1 className="text-3xl font-bold text-gray-800 hidden lg:block">Create Order</h1>
        </div>

        <main className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Customer Info */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Customer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="customer_name" className="block text-xs font-medium text-gray-600 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#A9DFBF] focus:border-[#A9DFBF] text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-gray-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    inputMode="numeric"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="09171234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#A9DFBF] focus:border-[#A9DFBF] text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#A9DFBF] focus:border-[#A9DFBF] text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="order_date" className="block text-xs font-medium text-gray-600 mb-1">Order Date</label>
                  <input
                    type="date"
                    id="order_date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#A9DFBF] focus:border-[#A9DFBF] text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="pickup_date" className="block text-xs font-medium text-gray-600 mb-1">Pickup Date</label>
                  <input
                    type="date"
                    id="pickup_date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={getMinPickupDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#A9DFBF] focus:border-[#A9DFBF] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('gcash')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        paymentMethod === 'gcash'
                          ? 'bg-[#007DFE] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      GCash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('maribank')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        paymentMethod === 'maribank'
                          ? 'bg-[#F26522] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      MariBank
                    </button>
                  </div>
                </div>
              </div>

              {/* Send Email Option */}
              {email && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="w-4 h-4 text-[#82C3A3] border-gray-300 rounded focus:ring-[#82C3A3]"
                    />
                    <span className="text-sm text-gray-700">Send confirmation email to customer</span>
                  </label>
                </div>
              )}
            </div>

            {/* Add Order Item */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Add Item</h2>
              <div className="flex flex-col gap-3">
                {/* Category Dropdown */}
                <div className="w-full">
                  <label htmlFor="category" className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <CustomSelect
                    options={categories.map(cat => ({
                      value: cat,
                      label: cat
                    }))}
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    placeholder="Select a category"
                  />
                </div>

                {/* Product and Quantity Row */}
                <div className="flex flex-col md:flex-row items-end gap-2">
                  <div className="flex-grow w-full">
                    <label htmlFor="product" className="block text-xs font-medium text-gray-600 mb-1">Product</label>
                    <CustomSelect
                      options={filteredProducts.map(p => ({
                        value: p.id,
                        label: `${p.name} - ₱${p.price.toFixed(2)}`
                      }))}
                      value={selectedProductId}
                      onChange={setSelectedProductId}
                      placeholder="Select a product"
                    />
                  </div>
                  <div className="w-full md:w-auto">
                    <label htmlFor="quantity" className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      value={quantity}
                      onChange={handleQuantityChange}
                      onFocus={(e) => e.target.select()}
                      className="w-full md:w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#A9DFBF] focus:border-[#A9DFBF] text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-[#82C3A3] text-white font-medium rounded-md hover:bg-[#6BAF8B] transition-colors text-sm"
                  >
                    <Plus size={16} /> Add Item
                  </button>
                </div>
              </div>
            </div>

            {/* Order Items List */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Order Summary</h2>
              {orderItems.length === 0 ? (
                <p className="text-gray-500 text-center py-3 text-xs">No items added yet</p>
              ) : (
                <div className="space-y-1">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{item.product_name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity} × ₱{item.unit_price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 text-sm">₱{item.subtotal.toFixed(2)}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-dashed border-gray-300">
                <div className="flex justify-between items-center">
                  <p className="text-base font-bold text-gray-800">Order Total</p>
                  <p className="text-base font-bold text-gray-800">₱{calculateTotal().toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-2">
              <Link
                href="/orders"
                className="px-4 py-2 font-medium text-gray-700 border border-gray-300 bg-white rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || orderItems.length === 0}
                className="px-4 py-2 font-medium text-white bg-[#82C3A3] rounded-md hover:bg-[#6BAF8B] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Saving...' : 'Save Order'}
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message="Item added to order!"
          onClose={() => setShowToast(false)}
        />
      )}
    </AppLayout>
  );
}
