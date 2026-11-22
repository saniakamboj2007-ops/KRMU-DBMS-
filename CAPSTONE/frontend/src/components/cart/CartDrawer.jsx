import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';

export function CartDrawer({ onProceedToCheckout }) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    deliveryFee,
    taxAmount,
    discountAmount,
    totalAmount,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    clearCart
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const handleApply = (e) => {
    e.preventDefault();
    if (couponInput) {
      applyCoupon(couponInput);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 1050,
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        background: 'white',
        width: '100%',
        maxWidth: '420px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
        animation: 'slideInRight 0.25s ease'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>Your Cart</h3>
            {cart.restaurant_name && (
              <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600 }}>
                From: {cart.restaurant_name}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {cart.items.length > 0 && (
              <button
                onClick={clearCart}
                style={{ fontSize: '12px', color: '#B91C1C', fontWeight: 600 }}
              >
                Clear Cart
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              style={{ fontSize: '20px', color: 'var(--text-light)', padding: '2px' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body Content */}
        {cart.items.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '14px' }}>🛒</div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Your cart is empty
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Explore the 8 verified kitchens of BHOOKH and add delicious dishes to satisfy your cravings.
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              style={{
                background: 'var(--primary)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700
              }}
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Free Delivery Bar */}
            <div style={{
              background: subtotal >= 500 ? '#ECFDF5' : '#FFFBEB',
              border: `1px solid ${subtotal >= 500 ? '#A7F3D0' : '#FDE68A'}`,
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '12px',
              color: subtotal >= 500 ? '#065F46' : '#92400E',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🚚</span>
              <span>
                {subtotal >= 500
                  ? 'Yay! You unlocked FREE Delivery on this order!'
                  : `Add ₹${(500 - subtotal).toFixed(2)} more for FREE delivery`}
              </span>
            </div>

            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.items.map(item => (
                <div key={item.cart_item_id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-light)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        border: `1.5px solid ${item.is_veg ? '#2E7D32' : '#C62828'}`,
                        position: 'relative'
                      }}>
                        <span style={{
                          display: 'block',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: item.is_veg ? '#2E7D32' : '#C62828',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}></span>
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {item.item_name}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      ₹{parseFloat(item.price).toFixed(2)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Stepper */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #2E7D32',
                      borderRadius: '6px',
                      background: 'white'
                    }}>
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                        style={{ padding: '2px 8px', color: '#2E7D32', fontWeight: 800 }}
                      >
                        −
                      </button>
                      <span style={{ padding: '0 6px', fontSize: '12px', fontWeight: 800, color: '#2E7D32' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                        style={{ padding: '2px 8px', color: '#2E7D32', fontWeight: 800 }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: 700, minWidth: '60px', textAlign: 'right' }}>
                      ₹{parseFloat(item.total_price).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupons Section */}
            <div style={{ background: 'var(--bg-alt)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                🏷️ HAVE A COUPON CODE?
              </div>

              {appliedCoupon ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#ECFDF5',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #A7F3D0'
                }}>
                  <div>
                    <span style={{ fontWeight: 800, color: '#065F46', fontSize: '13px' }}>
                      {appliedCoupon.code} Applied!
                    </span>
                    <span style={{ fontSize: '12px', color: '#047857', marginLeft: '6px' }}>
                      (-₹{discountAmount.toFixed(2)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    style={{ fontSize: '12px', color: '#B91C1C', fontWeight: 700 }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    placeholder="Enter BHOOKH50 / WELCOME"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      textTransform: 'uppercase'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: 'var(--primary)',
                      color: 'white',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 700
                    }}
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && (
                <div style={{ color: '#DC2626', fontSize: '11px', marginTop: '6px', fontWeight: 600 }}>
                  {couponError}
                </div>
              )}

              {/* Quick Coupon Chips */}
              {!appliedCoupon && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => applyCoupon('BHOOKH50')}
                    style={{ background: 'white', border: '1px dashed var(--border)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}
                  >
                    BHOOKH50 (50% off)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCoupon('WELCOME')}
                    style={{ background: 'white', border: '1px dashed var(--border)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}
                  >
                    WELCOME (₹75 off)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCoupon('FEAST20')}
                    style={{ background: 'white', border: '1px dashed var(--border)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}
                  >
                    FEAST20 (20% off)
                  </button>
                </div>
              )}
            </div>

            {/* Bill Details */}
            <div style={{ background: 'white', border: '1px solid var(--border-light)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                Bill Details
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Item Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#065F46' }}>FREE</strong> : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Taxes & GST (5%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#059669', fontWeight: 600, marginBottom: '6px' }}>
                  <span>Coupon Discount</span>
                  <span>−₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div style={{
                borderTop: '1px solid var(--border)',
                marginTop: '10px',
                paddingTop: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--text-main)'
              }}>
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Checkout CTA */}
        {cart.items.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'white' }}>
            <button
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              style={{
                width: '100%',
                background: 'var(--primary)',
                color: 'white',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 800,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 14px rgba(26, 56, 43, 0.25)'
              }}
            >
              <span>{cart.items.reduce((s, i) => s + i.quantity, 0)} Items | ₹{totalAmount.toFixed(2)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Proceed to Checkout →
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
