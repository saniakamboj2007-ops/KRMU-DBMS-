import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function AuthModal({ isOpen, onClose }) {
  const { login, register, quickLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const res = await register({ full_name: fullName, email, password, phone });
        if (res.success) onClose();
        else setError(res.message);
      } else {
        const res = await login(email, password);
        if (res.success) onClose();
        else setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role) => {
    setError('');
    setLoading(true);
    const res = await quickLogin(role);
    setLoading(false);
    if (res.success) onClose();
    else setError(res.message);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '440px',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
              {isRegister ? 'Join BHOOKH' : 'Welcome to BHOOKH'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {isRegister ? 'Create an account to order from top restaurants' : 'Sign in to access your cart, addresses and orders'}
            </p>
          </div>
          <button onClick={onClose} style={{ fontSize: '20px', color: 'var(--text-light)', padding: '4px' }}>✕</button>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* 1-Click Demo Logins for Quick Viva/Evaluation */}
        <div style={{ background: 'var(--bg-alt)', padding: '12px', borderRadius: '10px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
            ⚡ 1-Click Demo Accounts (Capstone Evaluation):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuick('customer')}
              style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 4px', fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuick('flora_admin')}
              style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 4px', fontSize: '12px', fontWeight: 600, color: '#C85A32' }}
            >
              🍳 Flora Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuick('super_admin')}
              style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 4px', fontSize: '12px', fontWeight: 600, color: '#1E40AF' }}
            >
              👑 Super Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                placeholder="Aarav Sharma"
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
              placeholder="name@example.com"
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                placeholder="9811223344"
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--primary)',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 700,
              marginTop: '6px'
            }}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In to BHOOKH'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          {isRegister ? 'Already registered? ' : "Don't have an account? "}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ color: 'var(--accent)', fontWeight: 700 }}
          >
            {isRegister ? 'Sign In' : 'Create One'}
          </button>
        </div>
      </div>
    </div>
  );
}
