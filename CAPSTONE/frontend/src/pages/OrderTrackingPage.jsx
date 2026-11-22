import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function OrderTrackingPage({ order, onBackHome, onViewAllOrders }) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const statuses = [
    { key: 'Order Placed', label: 'Order Placed', icon: '📝', desc: 'Received by kitchen' },
    { key: 'Confirmed', label: 'Confirmed', icon: '👨‍🍳', desc: 'Order accepted' },
    { key: 'Preparing', label: 'Preparing', icon: '🍳', desc: 'Cooking fresh meals' },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: '🛵', desc: 'Driver on the way' },
    { key: 'Delivered', label: 'Delivered', icon: '🎉', desc: 'Enjoy your meal!' }
  ];

  const getStatusIndex = (status) => {
    return statuses.findIndex(s => s.key === status);
  };

  const activeIndex = getStatusIndex(currentOrder.order_status);

  // Reload order details periodically or on demand
  const reloadOrder = async () => {
    try {
      setLoading(true);
      const res = await api.getOrderById(currentOrder.order_id);
      if (res.success && res.order) {
        setCurrentOrder(res.order);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Demo simulator for viva evaluation: advance status to next step!
  const advanceStatus = async () => {
    if (activeIndex >= statuses.length - 1) return;
    const nextStatus = statuses[activeIndex + 1].key;
    try {
      setUpdating(true);
      const res = await api.updateOrderStatus(
        currentOrder.order_id,
        nextStatus,
        `Status updated to ${nextStatus} via BHOOKH Live Tracking Simulator.`
      );
      if (res.success && res.order) {
        setCurrentOrder(res.order);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Success Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1A382B 0%, #12271E 100%)',
        color: 'white',
        borderRadius: '20px',
        padding: '36px 30px',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(26, 56, 43, 0.25)',
        marginBottom: '30px',
        position: 'relative'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          margin: '0 auto 16px'
        }}>
          ✓
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>
          {currentOrder.order_status === 'Delivered' ? 'Order Delivered!' : 'Order Placed Successfully!'}
        </h1>

        <p style={{ fontSize: '14px', opacity: 0.85, marginBottom: '16px' }}>
          Thank you for choosing BHOOKH. Your meal is being prepared with care.
        </p>

        <div style={{ display: 'inline-flex', gap: '16px', background: 'rgba(255, 255, 255, 0.1)', padding: '8px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: 700 }}>
          <span>Order Code: <code style={{ color: '#FCD34D' }}>{currentOrder.order_code}</code></span>
          <span>•</span>
          <span>Payment: {currentOrder.payment_method} ({currentOrder.payment_status})</span>
        </div>
      </div>

      {/* Live Order Timeline Progress */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
            Live Tracking Timeline
          </h3>

          {/* Evaluation Simulation Button */}
          {activeIndex < statuses.length - 1 && (
            <button
              onClick={advanceStatus}
              disabled={updating}
              style={{
                background: '#EFF6FF',
                border: '1px solid #93C5FD',
                color: '#1D4ED8',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {updating ? 'Updating...' : `⚡ Simulate: Advance to "${statuses[activeIndex + 1].label}"`}
            </button>
          )}
        </div>

        {/* Horizontal Milestone Stepper */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '30px' }}>
          {/* Connector Line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '30px',
            right: '30px',
            height: '4px',
            background: 'var(--border-light)',
            zIndex: 1
          }}>
            <div style={{
              height: '100%',
              background: 'var(--primary)',
              width: `${(activeIndex / (statuses.length - 1)) * 100}%`,
              transition: 'width 0.4s ease'
            }} />
          </div>

          {statuses.map((s, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div key={s.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '90px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: isCurrent ? 'var(--accent)' : isCompleted ? 'var(--primary)' : 'white',
                  border: isCompleted ? 'none' : '2px solid var(--border)',
                  color: isCompleted ? 'white' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  marginBottom: '8px',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(200, 90, 50, 0.25)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {s.icon}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: isCurrent ? 800 : 600,
                  color: isCurrent ? 'var(--accent)' : isCompleted ? 'var(--primary)' : 'var(--text-muted)',
                  textAlign: 'center'
                }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-light)', textAlign: 'center', marginTop: '2px' }}>
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit Status History Logs */}
        {currentOrder.status_history && currentOrder.status_history.length > 0 && (
          <div style={{ background: 'var(--bg-alt)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
              Database Audit Trail (order_status_history):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentOrder.status_history.map(h => (
                <div key={h.history_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                  <div>
                    <strong style={{ color: 'var(--primary)' }}>{h.status}</strong>: {h.comment}
                  </div>
                  <div style={{ color: 'var(--text-light)', fontSize: '11px' }}>
                    {new Date(h.changed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Details Receipt Card */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
          Delivery & Receipt
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Restaurant</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
              {currentOrder.restaurant_name}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Delivery Address</div>
            <div style={{ fontSize: '13px', color: 'var(--text-main)', marginTop: '2px' }}>
              {currentOrder.delivery_address_snapshot}
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginBottom: '14px' }}>
          {currentOrder.items && currentOrder.items.map(item => (
            <div key={item.order_item_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span>{item.quantity}x {item.item_name}</span>
              <span style={{ fontWeight: 700 }}>₹{parseFloat(item.total_price).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Bill Total */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
          <span>Total Paid ({currentOrder.payment_method})</span>
          <span>₹{parseFloat(currentOrder.total_amount).toFixed(2)}</span>
        </div>
      </div>

      {/* Action Navigation */}
      <div style={{ display: 'flex', gap: '14px' }}>
        <button
          onClick={onBackHome}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'white',
            color: 'var(--text-main)',
            fontSize: '14px',
            fontWeight: 700
          }}
        >
          Explore More Restaurants
        </button>

        <button
          onClick={onViewAllOrders}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            background: 'var(--primary)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 700
          }}
        >
          View My Orders History
        </button>
      </div>
    </div>
  );
}
