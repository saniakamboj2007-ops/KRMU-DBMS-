import React from 'react';
import { useCart } from '../../context/CartContext';

export function RestaurantConflictModal() {
  const { conflictModal, resolveConflict } = useCart();

  if (!conflictModal.isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '460px',
        padding: '28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        textAlign: 'center'
      }}>
        {/* Warning Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#FEF3C7',
          color: '#D97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '26px'
        }}>
          ⚠️
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
          Replace items in cart?
        </h3>

        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
          Your cart currently contains delicious dishes from <strong style={{ color: 'var(--primary)' }}>{conflictModal.currentRestaurant}</strong>.
          <br /><br />
          Do you want to discard your existing cart and start a fresh order with items from <strong style={{ color: 'var(--accent)' }}>{conflictModal.newRestaurant}</strong>?
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => resolveConflict(false)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'white',
              color: 'var(--text-main)',
              fontSize: '14px',
              fontWeight: 700
            }}
          >
            Keep Existing Cart
          </button>
          
          <button
            onClick={() => resolveConflict(true)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              background: 'var(--accent)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(200, 90, 50, 0.3)'
            }}
          >
            Clear Cart & Add
          </button>
        </div>
      </div>
    </div>
  );
}
