import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export function Navbar({ onNavigate, currentPage, onOpenAuth, onSearchChange, searchQuery, pureVegOnly, onTogglePureVeg }) {
  const { user, logout, quickLogin } = useAuth();
  const { cart, setIsCartOpen } = useCart();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="brand-logo" onClick={() => onNavigate('home')}>
            <span>BHOOKH</span>
            <span className="logo-badge">FOODS</span>
          </button>
          
          <div className="location-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Sohna Road, Gurugram</span>
          </div>
        </div>

        {/* Global Search Bar (Only shown on home) */}
        {currentPage === 'home' && (
          <div style={{ position: 'relative', width: '340px' }}>
            <input
              type="text"
              placeholder="Search restaurants, dishes or cuisines..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 16px 9px 38px',
                borderRadius: '9999px',
                border: '1px solid var(--border)',
                background: 'var(--bg-alt)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
            />
            <svg
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
        )}

        {/* Nav Actions */}
        <div className="nav-links">
          {/* Pure Veg Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '16px',
              height: '16px',
              border: '2px solid #2E7D32',
              borderRadius: '3px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2E7D32' }}></span>
            </span>
            <span>Pure Veg</span>
            <input
              type="checkbox"
              checked={pureVegOnly}
              onChange={(e) => onTogglePureVeg(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
          </label>

          <button className={`nav-link ${currentPage === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')}>
            Explore
          </button>

          {user && (
            <button className={`nav-link ${currentPage === 'my-orders' ? 'active' : ''}`} onClick={() => onNavigate('my-orders')}>
              My Orders
            </button>
          )}

          <button className={`nav-link ${currentPage === 'admin' ? 'active' : ''}`} onClick={() => onNavigate('admin')}>
            Admin Portal
          </button>

          {/* Cart Button */}
          <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            <span>Cart</span>
            {cart.item_count > 0 && <span className="cart-count">{cart.item_count}</span>}
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 700
              }}>
                {user.full_name}
              </div>
              <button
                onClick={logout}
                style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 600 }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              style={{
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '14px',
                fontWeight: 700
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
