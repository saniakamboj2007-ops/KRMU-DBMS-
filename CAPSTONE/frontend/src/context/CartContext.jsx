import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({
    cart_id: null,
    restaurant_id: null,
    restaurant_name: null,
    items: [],
    subtotal: 0,
    item_count: 0
  });
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Single-Restaurant Conflict Modal State
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    currentRestaurant: '',
    newRestaurant: '',
    pendingItem: null,
    pendingQty: 1
  });

  const fetchCart = async () => {
    if (!user) {
      // Local storage cart for guest
      const localCart = localStorage.getItem('bhookh_guest_cart');
      if (localCart) {
        try { setCart(JSON.parse(localCart)); } catch (e) {}
      }
      return;
    }
    try {
      setLoading(true);
      const res = await api.getCart();
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (e) {
      console.error('Failed to fetch cart:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (item, quantity = 1, forceClear = false) => {
    // Check Single-Restaurant Rule locally first
    if (cart.restaurant_id && cart.restaurant_id !== item.restaurant_id && cart.items.length > 0) {
      if (!forceClear) {
        setConflictModal({
          isOpen: true,
          currentRestaurant: cart.restaurant_name || 'Current Restaurant',
          newRestaurant: item.restaurant_name || 'Selected Restaurant',
          pendingItem: item,
          pendingQty: quantity
        });
        return { conflict: true };
      }
    }

    if (user) {
      const res = await api.addToCart(item.item_id, quantity, forceClear);
      if (res.data && res.data.conflict) {
        setConflictModal({
          isOpen: true,
          currentRestaurant: res.data.currentRestaurant,
          newRestaurant: res.data.newRestaurant,
          pendingItem: item,
          pendingQty: quantity
        });
        return { conflict: true };
      }
      await fetchCart();
      setIsCartOpen(true);
      return { success: true };
    } else {
      // Guest local cart
      let newItems = forceClear ? [] : [...cart.items];
      const existing = newItems.find(i => i.item_id === item.item_id);
      if (existing) {
        existing.quantity += quantity;
        existing.total_price = existing.quantity * existing.price;
      } else {
        newItems.push({
          cart_item_id: Date.now(),
          item_id: item.item_id,
          item_name: item.name,
          price: parseFloat(item.price),
          quantity,
          is_veg: item.is_veg,
          image_url: item.image_url,
          total_price: parseFloat(item.price) * quantity
        });
      }
      const subtotal = newItems.reduce((sum, i) => sum + i.total_price, 0);
      const guestCart = {
        cart_id: 999,
        restaurant_id: item.restaurant_id,
        restaurant_name: item.restaurant_name || cart.restaurant_name,
        items: newItems,
        subtotal,
        item_count: newItems.reduce((sum, i) => sum + i.quantity, 0)
      };
      setCart(guestCart);
      localStorage.setItem('bhookh_guest_cart', JSON.stringify(guestCart));
      setIsCartOpen(true);
      return { success: true };
    }
  };

  const resolveConflict = async (proceedWithClear) => {
    if (proceedWithClear && conflictModal.pendingItem) {
      const item = conflictModal.pendingItem;
      const qty = conflictModal.pendingQty;
      setConflictModal({ isOpen: false, currentRestaurant: '', newRestaurant: '', pendingItem: null, pendingQty: 1 });
      await addToCart(item, qty, true);
    } else {
      setConflictModal({ isOpen: false, currentRestaurant: '', newRestaurant: '', pendingItem: null, pendingQty: 1 });
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (user) {
      await api.updateCartQuantity(cartItemId, quantity);
      await fetchCart();
    } else {
      let newItems = [...cart.items];
      if (quantity <= 0) {
        newItems = newItems.filter(i => i.cart_item_id !== cartItemId);
      } else {
        const item = newItems.find(i => i.cart_item_id === cartItemId);
        if (item) {
          item.quantity = quantity;
          item.total_price = item.price * quantity;
        }
      }
      const subtotal = newItems.reduce((sum, i) => sum + i.total_price, 0);
      const guestCart = {
        ...cart,
        restaurant_id: newItems.length === 0 ? null : cart.restaurant_id,
        restaurant_name: newItems.length === 0 ? null : cart.restaurant_name,
        items: newItems,
        subtotal,
        item_count: newItems.reduce((sum, i) => sum + i.quantity, 0)
      };
      setCart(guestCart);
      localStorage.setItem('bhookh_guest_cart', JSON.stringify(guestCart));
    }
  };

  const clearCart = async () => {
    if (user) {
      await api.clearCart();
      await fetchCart();
    } else {
      const emptyCart = {
        cart_id: null,
        restaurant_id: null,
        restaurant_name: null,
        items: [],
        subtotal: 0,
        item_count: 0
      };
      setCart(emptyCart);
      localStorage.removeItem('bhookh_guest_cart');
    }
    setAppliedCoupon(null);
  };

  // Pricing calculations
  const subtotal = cart.subtotal || 0;
  const deliveryFee = subtotal >= 500 || subtotal === 0 ? 0 : 40;
  const taxAmount = +(subtotal * 0.05).toFixed(2); // 5% GST

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.max_discount && discountAmount > appliedCoupon.max_discount) {
        discountAmount = appliedCoupon.max_discount;
      }
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
    if (discountAmount > subtotal) discountAmount = subtotal;
  }
  discountAmount = +discountAmount.toFixed(2);
  const totalAmount = +(Math.max(0, subtotal + deliveryFee + taxAmount - discountAmount)).toFixed(2);

  const applyCoupon = (code) => {
    setCouponError('');
    const c = code.trim().toUpperCase();
    if (c === 'BHOOKH50') {
      if (subtotal < 200) {
        setCouponError('Minimum order amount for BHOOKH50 is ₹200');
        return false;
      }
      setAppliedCoupon({ code: 'BHOOKH50', discount_type: 'percentage', discount_value: 50, max_discount: 100 });
      return true;
    } else if (c === 'WELCOME') {
      if (subtotal < 250) {
        setCouponError('Minimum order amount for WELCOME is ₹250');
        return false;
      }
      setAppliedCoupon({ code: 'WELCOME', discount_type: 'flat', discount_value: 75 });
      return true;
    } else if (c === 'FEAST20') {
      if (subtotal < 400) {
        setCouponError('Minimum order amount for FEAST20 is ₹400');
        return false;
      }
      setAppliedCoupon({ code: 'FEAST20', discount_type: 'percentage', discount_value: 20, max_discount: 150 });
      return true;
    } else {
      setCouponError('Invalid coupon code. Try BHOOKH50, WELCOME, or FEAST20');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      subtotal,
      deliveryFee,
      taxAmount,
      discountAmount,
      totalAmount,
      appliedCoupon,
      couponError,
      isCartOpen,
      setIsCartOpen,
      conflictModal,
      addToCart,
      resolveConflict,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
