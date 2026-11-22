import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';

export function HomePage({ onSelectRestaurant, searchQuery, pureVegOnly, onTogglePureVeg }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const cuisinesList = [
    'All',
    'Italian',
    'North Indian',
    'Cafe',
    'Korean',
    'Healthy Food',
    'Burgers',
    'Pizza'
  ];

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (pureVegOnly) params.pure_veg = 'true';
      if (selectedCuisine && selectedCuisine !== 'All') params.cuisine = selectedCuisine;
      if (minRating) params.min_rating = minRating;
      if (sortBy) params.sort = sortBy;

      const res = await api.getRestaurants(params);
      if (res.success && res.restaurants) {
        setRestaurants(res.restaurants);
      }
    } catch (err) {
      console.error('Failed to load restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [searchQuery, pureVegOnly, selectedCuisine, minRating, sortBy]);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <span className="hero-tagline">
              📍 DELIVERING ACROSS SOHNA & GURUGRAM
            </span>
            <h1 className="hero-headline">
              Your Hunger Deserves Something Better.
            </h1>
            <p className="hero-subtext">
              Order gourmet meals from Sohna's celebrated eateries and curated culinary kitchens with lightning-fast delivery and real-time status tracking.
            </p>

            {/* Coupons Ribbon */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(4px)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontWeight: 800, color: '#FCD34D' }}>BHOOKH50</span>
                <span>• 50% Flat Off up to ₹100</span>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(4px)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontWeight: 800, color: '#FCD34D' }}>WELCOME</span>
                <span>• Flat ₹75 Off on ₹250+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '40px' }}>
        {/* Quick Category Chips */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '14px',
          marginBottom: '24px',
          scrollbarWidth: 'none'
        }}>
          {cuisinesList.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 700,
                border: selectedCuisine === c ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: selectedCuisine === c ? 'var(--primary)' : 'white',
                color: selectedCuisine === c ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Filters Toolbar */}
        <div style={{
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
              {restaurants.length} {restaurants.length === 1 ? 'Restaurant' : 'Restaurants'} Found
            </div>

            {/* Min Rating Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Rating:</span>
              <select
                value={minRating}
                onChange={e => setMinRating(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                <option value="">All Ratings</option>
                <option value="4.0">4.0+ ★</option>
                <option value="4.5">4.5+ ★</option>
              </select>
            </div>
          </div>

          {/* Sort By Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              <option value="rating">Rating: High to Low</option>
              <option value="delivery_time">Fastest Delivery</option>
              <option value="cost_asc">Cost: Low to High</option>
              <option value="cost_desc">Cost: High to Low</option>
            </select>
          </div>
        </div>

        {/* Restaurant Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>🍲</div>
            <p style={{ fontWeight: 600 }}>Loading BHOOKH kitchens...</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '50px 20px',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>No restaurants found</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              No restaurants match your active filters. Try resetting your search or filters.
            </p>
            <button
              onClick={() => {
                setSelectedCuisine('All');
                setMinRating('');
                setSortBy('rating');
                onTogglePureVeg(false);
              }}
              style={{
                background: 'var(--primary)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '24px'
          }}>
            {restaurants.map(rest => (
              <RestaurantCard
                key={rest.restaurant_id}
                restaurant={rest}
                onClick={() => onSelectRestaurant(rest.restaurant_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
