'use client';

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
  is_production_complete: boolean;
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
  onUpdate?: () => void;
};

export default function OrderCard({ order, onUpdate }: OrderCardProps) {
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

  async function handleToggleComplete() {
    if (loading) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('Orders')
        .update({ is_completed: !order.is_completed })
        .eq('id', order.id);

      if (error) throw error;

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error toggling completion status:', error);
      alert('Failed to update completion status');
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

      if (onUpdate) onUpdate();
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

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  }

  return (
    <>
      <div className={`p-3 rounded-lg shadow-sm border ${order.is_completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-wrap justify-between items-start">
          <div className="mb-2 md:mb-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className={`font-semibold text-base ${order.is_completed ? 'text-gray-500' : 'text-gray-800'}`}>
                {order.customer_name}
              </p>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500">{order.formattedDate}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle Switch for Payment Status */}
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-medium ${order.is_paid ? 'text-gray-400' : 'text-[#E8A87C]'}`}>
                Unpaid
              </span>
              <button
                onClick={handleTogglePaid}
                disabled={loading}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  order.is_paid ? 'bg-[#82C3A3]' : 'bg-[#E8A87C]'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title="Click to toggle paid status"
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    order.is_paid ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className={`text-[10px] font-medium ${order.is_paid ? 'text-[#82C3A3]' : 'text-gray-400'}`}>
                Paid
              </span>
            </div>
            <p className={`font-semibold text-base ${order.is_completed ? 'text-gray-500' : 'text-gray-800'}`}>
              ₱{Number(order.total_amount).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Expanded Order Items */}
        {expanded && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            {loadingItems ? (
              <p className="text-gray-500 text-center py-1.5 text-xs">Loading items...</p>
            ) : orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-1.5 text-xs">No items found</p>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-600 mb-1">Order Items:</p>
                {orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-800">{item.product_name}</p>
                      <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-gray-700">₱{item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-2 justify-end">
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
              order.is_completed
                ? 'text-gray-600 bg-gray-200 hover:bg-gray-300'
                : 'text-white bg-[#82C3A3] hover:bg-[#6BAF8B]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Updating...' : order.is_completed ? 'Mark as Not Received' : 'Mark as Received'}
          </button>
          <button
            onClick={() => {
              // Navigate to edit page - we'll need to use window.location since we can't use useRouter here
              window.location.href = `/orders/edit/${order.id}`;
            }}
            disabled={loading || order.is_completed}
            className="text-xs text-gray-700 font-medium px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={order.is_completed ? 'Cannot edit completed orders' : 'Edit order'}
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
            className="text-xs text-white font-medium px-3 py-1.5 rounded-md bg-[#E57373] hover:bg-[#D75A5A] disabled:bg-[#F5A5A5] transition-colors"
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
