import React from 'react';

export function RestaurantCard({ restaurant, onClick }) {
  const isReal = restaurant.verification_status === 'VERIFIED_REAL';

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Cover Image & Badges */}
      <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
        <img
          src={restaurant.banner_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'}
          alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* Verification Pill */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: isReal ? 'rgba(26, 56, 43, 0.9)' : 'rgba(30, 41, 59, 0.85)',
          color: 'white',
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          backdropFilter: 'blur(4px)'
        }}>
          {isReal ? (
            <>
              <span style={{ color: '#4ADE80' }}>✓</span> Real Establishment
            </>
          ) : (
            <>
              <span>★</span> Curated Kitchen
            </>
          )}
        </div>

        {/* Pure Veg Pill */}
        {restaurant.pure_veg && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(46, 125, 50, 0.95)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            backdropFilter: 'blur(4px)'
          }}>
            Pure Veg
          </div>
        )}

        {/* Delivery Time Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '12px',
          background: 'rgba(0,0,0,0.75)',
          color: 'white',
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 600,
          backdropFilter: 'blur(2px)'
        }}>
          ⏱ {restaurant.delivery_time_mins || 30} mins
        </div>
      </div>

      {/* Info Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              {restaurant.name}
            </h3>
            <div style={{
              background: '#2E7D32',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <span>{restaurant.rating || '4.2'}</span>
              <span>★</span>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {restaurant.cuisine_type}
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{restaurant.locality}, {restaurant.city}</span>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <span>₹{Math.round(restaurant.average_cost_for_two)} for two</span>
          <span style={{ color: restaurant.delivery_fee === 0 ? '#2E7D32' : 'inherit', fontWeight: restaurant.delivery_fee === 0 ? 700 : 500 }}>
            {restaurant.delivery_fee === 0 ? 'Free Delivery' : `₹${Math.round(restaurant.delivery_fee)} delivery`}
          </span>
        </div>
      </div>
    </div>
  );
}
