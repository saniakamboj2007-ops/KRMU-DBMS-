import React from 'react';

export function Footer() {
  return (
    <footer style={{ background: 'var(--primary-dark)', color: 'white', padding: '50px 0 30px', marginTop: '60px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 800, marginBottom: '14px' }}>
              <span>BHOOKH</span>
              <span style={{ background: 'var(--accent)', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>FOODS</span>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: 1.6 }}>
              A high-performance multi-restaurant food ordering and delivery web application built for seamless dining in Sohna & Gurugram, Haryana.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Featured Restaurants</h4>
            <ul style={{ listStyle: 'none', color: '#9CA3AF', fontSize: '14px', lineHeight: 2 }}>
              <li>Flora Café (Opp. GD Goenka University)</li>
              <li>The Urban Fork (Italian Trattoria)</li>
              <li>Brew & Bean (Artisan Roasters)</li>
              <li>Spice Theory (Royal Mughlai)</li>
              <li>Seoul Street (Korean Street Eats)</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Database & Architecture</h4>
            <ul style={{ listStyle: 'none', color: '#9CA3AF', fontSize: '14px', lineHeight: 2 }}>
              <li>MySQL 8.0 & MySQL Workbench</li>
              <li>Database Name: <code>bHOOKH_db</code></li>
              <li>17 Normalized Relational Tables</li>
              <li>Single-Restaurant Cart Constraints</li>
              <li>Razorpay Test Mode & Cash on Delivery</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Demo Accounts</h4>
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '14px', borderRadius: '8px', fontSize: '13px', color: '#D1D5DB' }}>
              <div><strong>Customer:</strong> aarav@gmail.com</div>
              <div><strong>Flora Admin:</strong> flora@bhookh.com</div>
              <div><strong>Super Admin:</strong> admin@bhookh.com</div>
              <div style={{ marginTop: '6px', color: '#FBBF24' }}>Password: <code>Bhookh@2026</code></div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>
          &copy; {new Date().getFullYear()} BHOOKH Multi-Restaurant Food Ordering Application. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
