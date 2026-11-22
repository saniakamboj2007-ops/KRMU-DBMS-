import React from 'react';
import { useCart } from '../../context/CartContext';

export function DishCard({ dish, restaurantName }) {
  const { cart, addToCart, updateQuantity } = useCart();

  const cartItem = cart.items.find(i => i.item_id === dish.item_id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart({
      ...dish,
      restaurant_name: restaurantName
    }, 1);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '20px 0',
      borderBottom: '1px solid var(--border-light)',
      gap: '20px'
    }}>
      {/* Left Details */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          {/* Veg/Non-veg Symbol */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            border: `2px solid ${dish.is_veg ? '#2E7D32' : '#C62828'}`,
            borderRadius: '3px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: dish.is_veg ? '#2E7D32' : '#C62828'
            }}></span>
          </span>

          {dish.is_popular && (
            <span style={{
              background: '#FEF3C7',
              color: '#B45309',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              ★ Bestseller
            </span>
          )}
        </div>

        <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
          {dish.name}
        </h4>

        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
          ₹{parseFloat(dish.price).toFixed(2)}
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '480px' }}>
          {dish.description}
        </p>
      </div>

      {/* Right Image & Add Button */}
      <div style={{ position: 'relative', width: '130px', height: '110px', flexShrink: 0 }}>
        <img
          src={dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
          alt={dish.name}
          style={{
            width: '100%',
            height: '95px',
            objectFit: 'cover',
            borderRadius: '12px'
          }}
        />

        <div style={{ position: 'absolute', bottom: '0px', left: '50%', transform: 'translateX(-50%)' }}>
          {quantity > 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              border: '1px solid #2E7D32',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => updateQuantity(cartItem.cart_item_id, quantity - 1)}
                style={{
                  padding: '4px 10px',
                  color: '#2E7D32',
                  fontWeight: 800,
                  fontSize: '14px',
                  background: 'none'
                }}
              >
                −
              </button>
              <span style={{ padding: '0 6px', fontWeight: 800, fontSize: '13px', color: '#2E7D32' }}>
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(cartItem.cart_item_id, quantity + 1)}
                style={{
                  padding: '4px 10px',
                  color: '#2E7D32',
                  fontWeight: 800,
                  fontSize: '14px',
                  background: 'none'
                }}
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              style={{
                background: 'white',
                border: '1px solid #2E7D32',
                color: '#2E7D32',
                fontWeight: 800,
                fontSize: '13px',
                padding: '6px 20px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
