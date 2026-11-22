import React, { useState } from 'react';

export function RazorpayModal({ isOpen, onClose, amount, orderCode, onPaymentSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [testUpiId, setTestUpiId] = useState('aarav@okhdfcbank');

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const mockPaymentId = 'pay_test_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const mockOrderId = 'order_rzp_' + Math.random().toString(36).substring(2, 10);
      const mockSignature = 'sig_' + Math.random().toString(36).substring(2, 12);

      setIsProcessing(false);
      onPaymentSuccess({
        razorpay_payment_id: mockPaymentId,
        razorpay_order_id: mockOrderId,
        razorpay_signature: mockSignature,
        payment_method: 'Razorpay'
      });
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '460px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Razorpay Blue Header */}
        <div style={{
          background: '#0B2265',
          color: 'white',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px' }}>Razorpay</span>
              <span style={{ background: '#2563EB', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                Test Mode
              </span>
            </div>
            <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
              BHOOKH Food Order • {orderCode || 'BHK-202611'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>
              ₹{parseFloat(amount).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Choose Payment Method
          </div>

          {/* Payment Method Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              onClick={() => setSelectedMethod('upi')}
              style={{
                flex: 1,
                padding: '10px 6px',
                borderRadius: '8px',
                border: selectedMethod === 'upi' ? '2px solid #2563EB' : '1px solid var(--border)',
                background: selectedMethod === 'upi' ? '#EFF6FF' : 'white',
                color: selectedMethod === 'upi' ? '#1E40AF' : 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              📱 UPI / QR
            </button>
            <button
              onClick={() => setSelectedMethod('card')}
              style={{
                flex: 1,
                padding: '10px 6px',
                borderRadius: '8px',
                border: selectedMethod === 'card' ? '2px solid #2563EB' : '1px solid var(--border)',
                background: selectedMethod === 'card' ? '#EFF6FF' : 'white',
                color: selectedMethod === 'card' ? '#1E40AF' : 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              💳 Card
            </button>
            <button
              onClick={() => setSelectedMethod('netbanking')}
              style={{
                flex: 1,
                padding: '10px 6px',
                borderRadius: '8px',
                border: selectedMethod === 'netbanking' ? '2px solid #2563EB' : '1px solid var(--border)',
                background: selectedMethod === 'netbanking' ? '#EFF6FF' : 'white',
                color: selectedMethod === 'netbanking' ? '#1E40AF' : 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              🏦 Net Banking
            </button>
          </div>

          {/* Method Content */}
          {selectedMethod === 'upi' && (
            <div style={{ background: 'var(--bg-alt)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                VPA / UPI ID (Test Simulator)
              </label>
              <input
                type="text"
                value={testUpiId}
                onChange={e => setTestUpiId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '10px'
                }}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', background: 'white', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: '#065F46', fontWeight: 600 }}>
                  ✓ Google Pay
                </span>
                <span style={{ fontSize: '11px', background: 'white', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: '#065F46', fontWeight: 600 }}>
                  ✓ PhonePe
                </span>
                <span style={{ fontSize: '11px', background: 'white', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: '#065F46', fontWeight: 600 }}>
                  ✓ Paytm
                </span>
              </div>
            </div>
          )}

          {selectedMethod === 'card' && (
            <div style={{ background: 'var(--bg-alt)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Simulated Test Card Details:
              </div>
              <div style={{ background: 'white', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Card: <code>4111 •••• •••• 1111</code>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, background: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px' }}>
                  Exp: 12/28
                </div>
                <div style={{ flex: 1, background: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px' }}>
                  CVV: ••• (mock)
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'netbanking' && (
            <div style={{ background: 'var(--bg-alt)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['HDFC Bank', 'ICICI Bank', 'SBI Bank'].map(bank => (
                  <div key={bank} style={{ background: 'white', border: '1px solid var(--border)', padding: '10px 4px', borderRadius: '6px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>
                    {bank}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              disabled={isProcessing}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'white',
                color: 'var(--text-muted)',
                fontSize: '14px',
                fontWeight: 700
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: '8px',
                background: '#2563EB',
                color: 'white',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              {isProcessing ? (
                <span>Authorizing Payment...</span>
              ) : (
                <span>Pay ₹{parseFloat(amount).toFixed(2)}</span>
              )}
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: '10px 24px', textAlign: 'center', fontSize: '11px', color: '#64748B' }}>
          🔒 Razorpay 256-bit SSL Encryption • PCI-DSS Compliant Test Gateway
        </div>
      </div>
    </div>
  );
}
