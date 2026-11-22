import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function MyOrdersPage({ onSelectOrder, onBackHome }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (user) {
        try {
          setLoading(true);
          const res = await api.getMyOrders();
          if (res.success && res.orders) {
            setOrders(res.orders);
          }
        } catch (e) {
          console.error('Failed to load user orders:', e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3>Please Sign In</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          You must be logged in to view your past orders and receipts.
        </p>
        <button onClick={onBackHome} style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: 700 }}>
          ← Back to Discovery
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 20px 80px', maxWidth: '860px', margin: '0 auto' }}>
      <button
        onClick={onBackHome}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          marginBottom: '20px'
        }}
      >
        ← Back to Discovery
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)' }}>
            My Orders
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Review your past food orders, receipts and tracking updates
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '30px', marginBottom: '10px' }}>🍲</div>
          <p style={{ fontWeight: 600 }}>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '50px 20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>No orders yet</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            You haven't placed any orders yet. Discover delicious kitchens in Sohna & Gurugram!
          </p>
          <button
            onClick={onBackHome}
            style={{
              background: 'var(--primary)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700
            }}
          >
            Explore Restaurants
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(ord => (
            <div
              key={ord.order_id}
              style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {ord.restaurant_name}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: ord.order_status === 'Delivered' ? '#ECFDF5' : '#EFF6FF',
                    color: ord.order_status === 'Delivered' ? '#065F46' : '#1D4ED8'
                  }}>
                    {ord.order_status}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Code: <code>{ord.order_code}</code> • {new Date(ord.placed_at).toLocaleDateString()} at {new Date(ord.placed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                  {ord.items ? ord.items.map(i => `${i.quantity}x ${i.item_name}`).join(', ') : 'Order items'}
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)' }}>
                  ₹{parseFloat(ord.total_amount).toFixed(2)}
                </div>
                <button
                  onClick={() => onSelectOrder(ord)}
                  style={{
                    background: 'var(--bg-alt)',
                    border: '1px solid var(--border)',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--primary)'
                  }}
                >
                  Track / Receipt →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
