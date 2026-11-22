import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function AdminDashboard({ onBackHome }) {
  const { user, quickLogin } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'restaurants'
  const [statusMessage, setStatusMessage] = useState('');

  const isAdmin = user && (user.role_name === 'super_admin' || user.role_name === 'restaurant_admin' || user.role_id === 1 || user.role_id === 2);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, restRes] = await Promise.all([
        api.getSuperAdminStats().catch(() => ({ success: false })),
        api.getAdminOrders().catch(() => ({ success: false })),
        api.getAdminRestaurants().catch(() => ({ success: false }))
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (ordersRes.success) setOrders(ordersRes.orders);
      if (restRes.success) setRestaurants(restRes.restaurants);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setStatusMessage(`Updating order #${orderId} to ${newStatus}...`);
      const res = await api.updateOrderStatus(orderId, newStatus, `Updated by admin (${user.full_name})`);
      if (res.success) {
        setStatusMessage(`Order #${orderId} status successfully transitioned to ${newStatus}!`);
        await fetchAdminData();
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (e) {
      setStatusMessage('Error updating status: ' + e.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
          Admin Authentication Required
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
          You must be logged in as a <strong>Super Administrator</strong> or <strong>Restaurant Manager</strong> to access the BHOOKH operations management portal.
        </p>

        <div style={{ background: 'var(--bg-alt)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'left' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
            ⚡ 1-Click Evaluation Sign In:
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => quickLogin('super_admin')}
              style={{
                flex: 1,
                background: 'var(--primary)',
                color: 'white',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              👑 Login as Super Admin
            </button>
            <button
              onClick={() => quickLogin('flora_admin')}
              style={{
                flex: 1,
                background: 'var(--accent)',
                color: 'white',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              🍳 Login as Flora Manager
            </button>
          </div>
        </div>

        <button onClick={onBackHome} style={{ marginTop: '24px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
          ← Back to Discovery
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 20px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <button
            onClick={onBackHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginBottom: '8px'
            }}
          >
            ← Back to Storefront
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>
            BHOOKH Operations & Database Portal
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Logged in as: <strong>{user.full_name}</strong> ({user.role_name})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              border: activeTab === 'orders' ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: activeTab === 'orders' ? 'var(--primary)' : 'white',
              color: activeTab === 'orders' ? 'white' : 'var(--text-main)'
            }}
          >
            📋 Orders Management ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              border: activeTab === 'restaurants' ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: activeTab === 'restaurants' ? 'var(--primary)' : 'white',
              color: activeTab === 'restaurants' ? 'white' : 'var(--text-main)'
            }}
          >
            🏪 Kitchens & Menus ({restaurants.length || 8})
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{ background: '#ECFDF5', color: '#065F46', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '20px', border: '1px solid #A7F3D0' }}>
          {statusMessage}
        </div>
      )}

      {/* KPI Cards Strip */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Outlets</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary)', marginTop: '4px' }}>
              {stats.total_restaurants}
            </div>
            <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>1 Verified Real + 7 Curated</div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Orders Placed</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary)', marginTop: '4px' }}>
              {stats.total_orders}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>Across all 8 kitchens</div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivered Revenue</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#059669', marginTop: '4px' }}>
              ₹{parseFloat(stats.delivered_revenue || 0).toFixed(2)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>view_restaurant_analytics</div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Users</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary)', marginTop: '4px' }}>
              {stats.total_users}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>Customers & Admins</div>
          </div>
        </div>
      )}

      {/* Tab 1: Orders Management */}
      {activeTab === 'orders' && (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
              Live Order Pipeline & Status Controller
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Updates trigger MySQL audit entries in <code>order_status_history</code>
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>Order Code</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Restaurant</th>
                  <th style={{ padding: '12px 16px' }}>Total Amount</th>
                  <th style={{ padding: '12px 16px' }}>Payment</th>
                  <th style={{ padding: '12px 16px' }}>Current Status</th>
                  <th style={{ padding: '12px 16px' }}>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.order_id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      <code>{o.order_code}</code>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{o.customer_phone}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {o.restaurant_name}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      ₹{parseFloat(o.total_amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: o.payment_status === 'Paid' || o.payment_status === 'Success' ? '#DCFCE7' : '#FEF3C7', color: o.payment_status === 'Paid' || o.payment_status === 'Success' ? '#166534' : '#B45309' }}>
                        {o.payment_method} ({o.payment_status})
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: o.order_status === 'Delivered' ? '#DCFCE7' : '#EFF6FF',
                        color: o.order_status === 'Delivered' ? '#166534' : '#1D4ED8'
                      }}>
                        {o.order_status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={o.order_status}
                        onChange={e => handleUpdateStatus(o.order_id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: 'white'
                        }}
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Kitchens & Menus Overview */}
      {activeTab === 'restaurants' && (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
              8 Configured Restaurants (bHOOKH Platform Directory)
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>ID</th>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th style={{ padding: '12px 16px' }}>Cuisine</th>
                  <th style={{ padding: '12px 16px' }}>Locality</th>
                  <th style={{ padding: '12px 16px' }}>Classification</th>
                  <th style={{ padding: '12px 16px' }}>Rating</th>
                  <th style={{ padding: '12px 16px' }}>Cost for 2</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map(r => (
                  <tr key={r.restaurant_id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{r.restaurant_id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary)' }}>
                      {r.name} {r.pure_veg && <span style={{ color: '#2E7D32', fontSize: '11px' }}>(Veg)</span>}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{r.cuisine_type}</td>
                    <td style={{ padding: '14px 16px' }}>{r.locality}, {r.city}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: r.verification_status === 'VERIFIED_REAL' ? '#DCFCE7' : '#F1F5F9',
                        color: r.verification_status === 'VERIFIED_REAL' ? '#166534' : '#475569'
                      }}>
                        {r.verification_status === 'VERIFIED_REAL' ? '✓ Real Verified' : '★ Curated Sample'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#2E7D32' }}>{r.rating} ★ ({r.review_count})</td>
                    <td style={{ padding: '14px 16px' }}>₹{Math.round(r.average_cost_for_two)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
