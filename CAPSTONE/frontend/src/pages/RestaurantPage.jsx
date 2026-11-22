import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DishCard } from '../components/restaurant/DishCard';
import { useCart } from '../context/CartContext';

export function RestaurantPage({ restaurantId, onBack, onOpenCart }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const { cart } = useCart();

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        const res = await api.getRestaurantById(restaurantId);
        if (res.success && res.restaurant) {
          setData(res.restaurant);
          if (res.restaurant.categories && res.restaurant.categories.length > 0) {
            setActiveCategory(res.restaurant.categories[0].category_id);
          }
        }
      } catch (e) {
        console.error('Failed to load restaurant details:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>🍲</div>
        <p style={{ fontWeight: 600 }}>Loading restaurant menu & details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3>Restaurant not found</h3>
        <button onClick={onBack} style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: 700 }}>
          ← Back to Discovery
        </button>
      </div>
    );
  }

  const isReal = data.verification_status === 'VERIFIED_REAL';

  // Group dishes by category
  const categoriesWithDishes = data.categories.map(cat => {
    let dishes = data.menu_items.filter(item => item.category_id === cat.category_id);
    if (filterVegOnly) {
      dishes = dishes.filter(item => item.is_veg);
    }
    return {
      ...cat,
      dishes
    };
  }).filter(c => c.dishes.length > 0);

  const cartFromThisRest = cart.restaurant_id === data.restaurant_id && cart.items.length > 0;

  return (
    <div style={{ paddingBottom: '100px' }}>
      {/* Top Navigation Breadcrumb */}
      <div className="container" style={{ padding: '16px 20px 0' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            marginBottom: '16px'
          }}
        >
          ← Back to All Restaurants
        </button>
      </div>

      {/* Restaurant Header Banner Card */}
      <div className="container">
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '30px'
        }}>
          {/* Header Image */}
          <div style={{ position: 'relative', height: '260px', width: '100%', overflow: 'hidden' }}>
            <img
              src={data.banner_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'}
              alt={data.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)'
            }} />

            {/* Badges on Header */}
            <div style={{ position: 'absolute', top: '16px', left: '20px', display: 'flex', gap: '8px' }}>
              <span style={{
                background: isReal ? 'rgba(26, 56, 43, 0.95)' : 'rgba(30, 41, 59, 0.9)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 800,
                backdropFilter: 'blur(4px)'
              }}>
                {isReal ? '✓ Verified Real Establishment' : '★ Curated Demo Kitchen'}
              </span>

              {data.pure_veg && (
                <span style={{
                  background: 'rgba(46, 125, 50, 0.95)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 800
                }}>
                  Pure Veg
                </span>
              )}
            </div>

            {/* Restaurant Title Info on Image */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>
                    {data.name}
                  </h1>
                  <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '6px' }}>
                    {data.cuisine_type} • {data.tagline}
                  </p>
                  <p style={{ fontSize: '12px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📍</span> {data.street_address}, {data.locality}, {data.city}, {data.state} - {data.pincode}
                  </p>
                </div>

                {/* Rating Badge */}
                <div style={{
                  background: 'white',
                  color: 'var(--text-main)',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span>{data.rating}</span>
                    <span>★</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {data.review_count} ratings
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Facts Strip */}
          <div style={{
            padding: '16px 24px',
            background: 'var(--bg-card)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⏱</span>
              <span><strong>Delivery Time:</strong> {data.delivery_time_mins || 30} mins</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🏷️</span>
              <span><strong>Minimum Order:</strong> ₹{parseFloat(data.minimum_order).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🚚</span>
              <span><strong>Delivery Fee:</strong> {data.delivery_fee === 0 ? 'FREE' : `₹${parseFloat(data.delivery_fee).toFixed(2)}`} (Free on orders above ₹500)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>💰</span>
              <span><strong>Cost for Two:</strong> ₹{Math.round(data.average_cost_for_two)} approx.</span>
            </div>
          </div>
        </div>

        {/* Menu Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '30px' }}>
          {/* Left Category Sidebar */}
          <aside style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
            <div style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Veg Only Filter Toggle */}
              <div style={{
                paddingBottom: '14px',
                marginBottom: '14px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Veg Only</span>
                <input
                  type="checkbox"
                  checked={filterVegOnly}
                  onChange={e => setFilterVegOnly(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </div>

              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Menu Categories
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {categoriesWithDishes.map(cat => (
                  <button
                    key={cat.category_id}
                    onClick={() => {
                      const el = document.getElementById(`cat-${cat.category_id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      background: 'var(--bg-alt)',
                      border: 'none',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {cat.category_name} ({cat.dishes.length})
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Dishes Column */}
          <main>
            {categoriesWithDishes.map(cat => (
              <section
                key={cat.category_id}
                id={`cat-${cat.category_id}`}
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ borderBottom: '2px solid var(--border)', paddingBottom: '12px', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
                    {cat.category_name}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {cat.dishes.length} items available
                  </p>
                </div>

                <div>
                  {cat.dishes.map(dish => (
                    <DishCard
                      key={dish.item_id}
                      dish={dish}
                      restaurantName={data.name}
                    />
                  ))}
                </div>
              </section>
            ))}

            {/* Customer Reviews Section */}
            <section style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', marginBottom: '16px' }}>
                Customer Reviews & Ratings ({data.reviews ? data.reviews.length : 0})
              </h3>

              {data.reviews && data.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {data.reviews.map(rev => (
                    <div key={rev.review_id} style={{
                      padding: '14px',
                      borderRadius: '8px',
                      background: 'var(--bg-alt)',
                      border: '1px solid var(--border-light)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                          {rev.user_name || 'Verified Customer'}
                        </span>
                        <span style={{
                          background: '#2E7D32',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          {rev.rating} ★
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  No customer reviews yet. Be the first to order and review!
                </p>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Floating Bottom Cart Bar (if user added items from this restaurant) */}
      {cartFromThisRest && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '680px',
          background: 'var(--primary)',
          color: 'white',
          padding: '14px 20px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px -5px rgba(26, 56, 43, 0.4)',
          zIndex: 900
        }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>{cart.items.reduce((s, i) => s + i.quantity, 0)} Items Added</div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>₹{cart.subtotal.toFixed(2)}</div>
          </div>
          <button
            onClick={onOpenCart}
            style={{
              background: 'white',
              color: 'var(--primary)',
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>View Cart</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
