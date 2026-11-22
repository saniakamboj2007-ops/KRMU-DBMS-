import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { RazorpayModal } from '../components/order/RazorpayModal';

export function CheckoutPage({ onOrderPlaced, onBackToCart }) {
  const { user } = useAuth();
  const { cart, subtotal, deliveryFee, taxAmount, discountAmount, totalAmount, appliedCoupon, clearCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Sohna');
  const [newPincode, setNewPincode] = useState('122103');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // 'Razorpay' or 'COD'
  
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [tempOrderData, setTempOrderData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAddresses() {
      if (user) {
        try {
          const res = await api.getAddresses();
          if (res.success && res.addresses && res.addresses.length > 0) {
            setAddresses(res.addresses);
            const def = res.addresses.find(a => a.is_default) || res.addresses[0];
            setSelectedAddressId(def.address_id);
          } else {
            setShowNewAddress(true);
          }
        } catch (e) {
          setShowNewAddress(true);
        }
      } else {
        setShowNewAddress(true);
      }
    }
    loadAddresses();
  }, [user]);

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3>Your cart is empty</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Please add items to your cart before proceeding to checkout.
        </p>
        <button onClick={onBackToCart} style={{ marginTop: '20px', color: 'var(--primary)', fontWeight: 700 }}>
          ← Return to Discovery
        </button>
      </div>
    );
  }

  const handleProceedToPay = async () => {
    setError('');

    // Formulate delivery address snapshot
    let addressSnapshot = '';
    let addressId = selectedAddressId;

    if (showNewAddress || !selectedAddressId) {
      if (!newStreet.trim()) {
        setError('Please enter a delivery street address.');
        return;
      }
      addressSnapshot = `${newStreet.trim()}, ${newCity}, Haryana - ${newPincode}`;

      // Persist address to user's address book if logged in
      if (user) {
        try {
          const addrRes = await api.addAddress({
            address_type: 'home',
            street_address: newStreet.trim(),
            city: newCity,
            state: 'Haryana',
            pincode: newPincode,
            is_default: true
          });
          if (addrRes.success && addrRes.address) {
            addressId = addrRes.address.address_id;
            setSelectedAddressId(addressId);
          }
        } catch (e) {
          console.warn('Address save note:', e);
        }
      }
    } else {
      const addr = addresses.find(a => a.address_id === selectedAddressId);
      if (addr) {
        addressSnapshot = `${addr.street_address}, ${addr.landmark ? addr.landmark + ', ' : ''}${addr.city}, ${addr.state} - ${addr.pincode}`;
      } else {
        addressSnapshot = 'Sohna Road, Gurugram, Haryana - 122103';
      }
    }

    const orderPayload = {
      delivery_address_id: addressId,
      street_address: newStreet.trim() || undefined,
      city: newCity,
      pincode: newPincode,
      delivery_address_snapshot: addressSnapshot,
      payment_method: paymentMethod || 'Razorpay',
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      special_instructions: specialInstructions.trim() || null
    };

    if (paymentMethod === 'Razorpay') {
      setTempOrderData(orderPayload);
      setIsRazorpayOpen(true);
    } else {
      // Cash on Delivery
      executeOrderPlacement(orderPayload);
    }
  };

  const executeOrderPlacement = async (payload, razorpayDetails = null) => {
    try {
      setSubmitting(true);
      const res = await api.createOrder({
        ...payload,
        razorpay_payment_id: razorpayDetails ? razorpayDetails.razorpay_payment_id : null,
        razorpay_order_id: razorpayDetails ? razorpayDetails.razorpay_order_id : null,
        razorpay_signature: razorpayDetails ? razorpayDetails.razorpay_signature : null
      });

      if (res.success && res.order) {
        await clearCart();
        onOrderPlaced(res.order);
      } else {
        setError(res.message || 'Failed to place order. Please check inputs.');
      }
    } catch (e) {
      setError(e.message || 'Order submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRazorpaySuccess = async (rzpResult) => {
    setIsRazorpayOpen(false);
    if (tempOrderData) {
      await executeOrderPlacement(tempOrderData, rzpResult);
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px 80px' }}>
      <button
        onClick={onBackToCart}
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
        ← Back to Menu
      </button>

      <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)', marginBottom: '24px' }}>
        Checkout & Payment
      </h1>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
        {/* Left Column: Customer Details, Address & Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Customer Details */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👤</span> 1. Customer Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Name</label>
                <input
                  type="text"
                  disabled
                  value={user ? user.full_name : 'Guest Customer (Aarav Sharma)'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-alt)', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Contact Phone</label>
                <input
                  type="text"
                  disabled
                  value={user ? user.phone : '9811223344'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-alt)', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📍</span> 2. Delivery Address
              </h3>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewAddress(!showNewAddress)}
                  style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}
                >
                  {showNewAddress ? 'Use Saved Address' : '+ Add New Address'}
                </button>
              )}
            </div>

            {!showNewAddress && addresses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {addresses.map(addr => (
                  <label
                    key={addr.address_id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: selectedAddressId === addr.address_id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: selectedAddressId === addr.address_id ? 'var(--primary-soft)' : 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.address_id}
                      onChange={() => setSelectedAddressId(addr.address_id)}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', textTransform: 'capitalize' }}>
                        {addr.address_type} {addr.is_default && <span style={{ color: 'var(--accent)', fontSize: '11px' }}>(Default)</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {addr.street_address}, {addr.landmark && `${addr.landmark}, `}{addr.city}, {addr.state} - {addr.pincode}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Street Address / Flat / Building</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Tower B, Raheja Aranya, Sohna Road"
                    value={newStreet}
                    onChange={e => setNewStreet(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>City</label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={e => setNewCity(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Pincode</label>
                    <input
                      type="text"
                      value={newPincode}
                      onChange={e => setNewPincode(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Special Instructions for Restaurant / Delivery (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ring the bell twice, keep it extra spicy"
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💳</span> 3. Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Option 1: Razorpay Test Mode */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '10px',
                border: paymentMethod === 'Razorpay' ? '2px solid #2563EB' : '1px solid var(--border)',
                background: paymentMethod === 'Razorpay' ? '#EFF6FF' : 'white',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#1E40AF' }}>
                      Razorpay Test Mode (Cards, UPI, Netbanking)
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Instant secure checkout simulation with mock UPI/Cards
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  RECOMMENDED
                </span>
              </label>

              {/* Option 2: Cash on Delivery */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '10px',
                border: paymentMethod === 'COD' ? '2px solid #2E7D32' : '1px solid var(--border)',
                background: paymentMethod === 'COD' ? '#F0FDF4' : 'white',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#166534' }}>
                      Cash on Delivery (COD)
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Pay in cash upon doorstep food delivery
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  CASH
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order CTA */}
        <div>
          <div style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: '90px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
              Order Summary
            </h3>

            {cart.restaurant_name && (
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
                Restaurant: {cart.restaurant_name}
              </div>
            )}

            {/* Items review */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
              {cart.items.map(item => (
                <div key={item.cart_item_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.quantity}x</span> {item.item_name}
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    ₹{parseFloat(item.total_price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#065F46' }}>FREE</strong> : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>GST (5%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>−₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{
                borderTop: '2px solid var(--border)',
                paddingTop: '10px',
                marginTop: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '17px',
                fontWeight: 900,
                color: 'var(--primary)'
              }}>
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handleProceedToPay}
              disabled={submitting}
              style={{
                width: '100%',
                background: 'var(--primary)',
                color: 'white',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 800,
                marginTop: '20px',
                boxShadow: '0 4px 14px rgba(26, 56, 43, 0.25)',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Placing Order...' : paymentMethod === 'Razorpay' ? `Pay ₹${totalAmount.toFixed(2)} with Razorpay` : `Place COD Order (₹${totalAmount.toFixed(2)})`}
            </button>

            <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-light)', marginTop: '12px' }}>
              PCI-DSS Secure • No card numbers or CVVs stored in database
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Test Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        amount={totalAmount}
        orderCode="BHK-CHECKOUT"
        onPaymentSuccess={handleRazorpaySuccess}
      />
    </div>
  );
}
