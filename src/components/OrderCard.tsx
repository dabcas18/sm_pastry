'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone_number: string;
  email: string;
  order_date: string;
  pickup_date: string;
  total_amount: number;
  is_paid: boolean;
  is_completed: boolean;
  is_production_complete: boolean;
  status: string;
  payment_method: string;
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

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-[#FADBD8] text-[#8B5A2B]', nextStatus: 'confirmed', nextLabel: 'Confirm Payment', nextLabelCash: 'Confirm Order' },
  confirmed: { label: 'Confirmed', color: 'bg-[#FFF8F5] text-[#82C3A3] border border-[#82C3A3]', nextStatus: 'ready', nextLabel: 'Mark Ready', nextLabelCash: 'Mark Ready' },
  ready: { label: 'Ready', color: 'bg-[#82C3A3] text-white', nextStatus: 'completed', nextLabel: 'Complete Order', nextLabelCash: 'Complete Order' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-500', nextStatus: null, nextLabel: null, nextLabelCash: null },
};

export default function OrderCard({ order, onUpdate }: OrderCardProps) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const currentStatus = order.status || 'pending';
  const statusConfig = STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const isCash = order.payment_method === 'cash';

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

  async function handleStatusChange(newStatus: string) {
    if (loading) return;

    setLoading(true);
    try {
      const updates: Record<string, any> = { status: newStatus };

      // Auto-update related flags
      if (newStatus === 'confirmed') {
        // Only mark as paid for non-cash orders (cash pays on pickup)
        if (!isCash) {
          updates.is_paid = true;
        }
      } else if (newStatus === 'completed') {
        updates.is_completed = true;
        updates.is_production_complete = true;
        // Cash orders are paid on completion
        if (isCash) {
          updates.is_paid = true;
        }
      }

      const { error } = await supabase
        .from('Orders')
        .update(updates)
        .eq('id', order.id);

      if (error) throw error;

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  }

  const formatPickupDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className={`p-3 rounded-lg shadow-sm border ${order.is_completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
        {/* Header with Order Number and Status */}
        <div className="flex flex-wrap justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {order.order_number && (
              <span className="text-xs font-mono font-bold text-[#82C3A3] bg-[#82C3A3]/10 px-2 py-0.5 rounded">
                {order.order_number}
              </span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className={`font-semibold text-base ${order.is_completed ? 'text-gray-500' : 'text-gray-800'}`}>
            ₱{Number(order.total_amount).toFixed(2)}
          </p>
        </div>

        {/* Customer Info */}
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
            <p className="text-xs text-gray-500">
              {order.formattedDate} {order.pickup_date && `• Pickup: ${formatPickupDate(order.pickup_date)}`}
            </p>
            {order.phone_number && (
              <p className="text-xs text-gray-400">{order.phone_number}</p>
            )}
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

        <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-2 justify-between items-center">
          {/* Status Action Button */}
          <div className="flex items-center gap-2">
            {statusConfig.nextStatus && (
              <button
                onClick={() => handleStatusChange(statusConfig.nextStatus!)}
                disabled={loading}
                className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors text-white bg-[#82C3A3] hover:bg-[#6BAF8B] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : (isCash ? statusConfig.nextLabelCash : statusConfig.nextLabel)}
              </button>
            )}
            {isCash && (
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Cash</span>
            )}
          </div>

          {/* Other Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
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
