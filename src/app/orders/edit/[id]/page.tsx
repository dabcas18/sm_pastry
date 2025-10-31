'use client';

import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [customerName, setCustomerName] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchOrderData();
    fetchProducts();
  }, [orderId]);

  async function fetchOrderData() {
    try {
      // Fetch order
      const { data: order, error: orderError } = await supabase
        .from('Orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      setCustomerName(order.customer_name);
      setOrderDate(new Date(order.order_date).toISOString().split('T')[0]);

      // Fetch order items with product details
      const { data: items, error: itemsError } = await supabase
        .from('OrderItems')
        .select(`
          id,
          product_id,
          quantity,
          unit_price,
          subtotal,
          Products (
            name
          )
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      const formattedItems = items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.Products?.name || 'Unknown',
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        subtotal: Number(item.subtotal)
      }));

      setOrderItems(formattedItems);
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Failed to load order');
      router.push('/orders');
    } finally {
      setFetching(false);
    }
  }

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

    setLoading(true);

    try {
      // Update order
      const { error: orderError } = await supabase
        .from('Orders')
        .update({
          customer_name: customerName,
          order_date: orderDate,
          total_amount: calculateTotal()
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Delete all existing order items
      const { error: deleteError } = await supabase
        .from('OrderItems')
        .delete()
        .eq('order_id', orderId);

      if (deleteError) throw deleteError;

      // Insert new order items
      const orderItemsData = orderItems.map(item => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal
      }));

      const { error: itemsError } = await supabase
        .from('OrderItems')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      // Success - redirect to orders page
      router.push('/orders');
      router.refresh();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <AppLayout title="Edit Order">
        <div className="flex items-center justify-center min-h-full">
          <p className="text-gray-500 text-sm">Loading order...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Order">
      <div className="min-h-full">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#FFF8F5] pt-6 pb-4 px-6">
          <h1 className="text-3xl font-bold text-gray-800 hidden lg:block">Edit Order</h1>
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
              </div>
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
                {loading ? 'Updating...' : 'Update Order'}
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
