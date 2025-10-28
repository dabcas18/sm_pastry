'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

type Order = {
  id: string;
  customer_name: string;
  order_date: string;
  total_amount: number;
  is_paid: boolean;
  is_completed: boolean;
  formattedDate: string;
};

type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

type OrderCardProps = {
  order: Order;
};

export default function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (expanded && orderItems.length === 0) {
      fetchOrderItems();
    }
  }, [expanded]);

  async function fetchOrderItems() {
    setLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from('OrderItems')
        .select(`
          quantity,
          unit_price,
          subtotal,
          Products (
            name
          )
        `)
        .eq('order_id', order.id);

      if (error) throw error;

      const items = data.map((item: any) => ({
        product_name: item.Products?.name || 'Unknown Product',
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        subtotal: Number(item.subtotal)
      }));

      setOrderItems(items);
    } catch (error) {
      console.error('Error fetching order items:', error);
    } finally {
      setLoadingItems(false);
    }
  }

  async function handleMarkDone() {
    if (loading) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('Orders')
        .update({ is_completed: true })
        .eq('id', order.id);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error('Error marking order as done:', error);
      alert('Failed to mark order as done');
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePaid() {
    if (loading) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('Orders')
        .update({ is_paid: !order.is_paid })
        .eq('id', order.id);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error('Error toggling paid status:', error);
      alert('Failed to update paid status');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConfirmed() {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('Orders')
        .delete()
        .eq('id', order.id);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  }

  function handleEdit() {
    router.push(`/orders/edit/${order.id}`);
  }

  return (
    <>
      <div className={`p-5 rounded-2xl shadow-md ${order.is_completed ? 'bg-gray-100' : 'bg-white'}`}>
        <div className="flex flex-wrap justify-between items-start">
          <div className="mb-4 md:mb-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={`font-bold text-xl ${order.is_completed ? 'text-gray-500' : 'text-gray-800'}`}>
                {order.customer_name}
              </p>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            <p className="text-sm text-gray-500">{order.formattedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePaid}
              disabled={loading || order.is_completed}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition-all ${
                order.is_paid
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              } ${(loading || order.is_completed) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={order.is_completed ? 'Cannot change paid status for completed orders' : 'Click to toggle paid status'}
            >
              {order.is_paid ? 'Paid' : 'Unpaid'}
            </button>
            <p className={`font-bold text-lg ${order.is_completed ? 'text-gray-500' : 'text-gray-800'}`}>
              ₱{Number(order.total_amount).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Expanded Order Items */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {loadingItems ? (
              <p className="text-gray-500 text-center py-2">Loading items...</p>
            ) : orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-2">No items found</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-600 mb-2">Order Items:</p>
                {orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">₱{item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
          {order.is_completed ? (
            <button
              disabled
              className="text-sm text-gray-500 font-medium px-4 py-2 rounded-lg bg-gray-200 cursor-not-allowed"
            >
              Completed
            </button>
          ) : (
            <button
              onClick={handleMarkDone}
              disabled={loading}
              className="text-sm text-white font-medium px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
            >
              {loading ? 'Updating...' : 'Mark Done'}
            </button>
          )}
          <button
            onClick={handleEdit}
            disabled={loading}
            className="text-sm text-gray-600 font-medium px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
            className="text-sm text-white font-medium px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-300 transition-colors"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Order?"
        message={`Are you sure you want to delete the order for ${order.customer_name}? This action cannot be undone and will also delete all order items.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}
