// ============================================================================
// BHOOKH — API Client Service
// ============================================================================

const API_BASE_URL = 'http://localhost:5000/api';

function getAuthHeader() {
  const token = localStorage.getItem('bhookh_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async register(data) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getAddresses() {
    const res = await fetch(`${API_BASE_URL}/auth/addresses`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async addAddress(address) {
    const res = await fetch(`${API_BASE_URL}/auth/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(address)
    });
    return res.json();
  },

  // Restaurants
  async getRestaurants(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/restaurants?${query}`);
    return res.json();
  },

  async getFeaturedRestaurants() {
    const res = await fetch(`${API_BASE_URL}/restaurants/featured`);
    return res.json();
  },

  async getRestaurantById(id) {
    const res = await fetch(`${API_BASE_URL}/restaurants/${id}`);
    return res.json();
  },

  async getCuisines() {
    const res = await fetch(`${API_BASE_URL}/restaurants/cuisines`);
    return res.json();
  },

  // Cart
  async getCart() {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async addToCart(itemId, quantity = 1, forceClear = false) {
    const res = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ item_id: itemId, quantity, force_clear: forceClear })
    });
    return { status: res.status, data: await res.json() };
  },

  async updateCartQuantity(cartItemId, quantity) {
    const res = await fetch(`${API_BASE_URL}/cart/quantity`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ cart_item_id: cartItemId, quantity })
    });
    return res.json();
  },

  async clearCart() {
    const res = await fetch(`${API_BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  // Orders
  async createOrder(orderData) {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(orderData)
    });
    return res.json();
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getOrderById(orderId) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async cancelOrder(orderId) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async updateOrderStatus(orderId, status, comment) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, comment })
    });
    return res.json();
  },

  // Admin
  async getSuperAdminStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getAdminUsers() {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getAdminRestaurants() {
    const res = await fetch(`${API_BASE_URL}/admin/restaurants`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getAdminOrders() {
    const res = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getRestaurantDashboard() {
    const res = await fetch(`${API_BASE_URL}/admin/restaurant-dashboard`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  }
};
