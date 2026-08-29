import axios from 'axios';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle token refresh on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('access_token', newAccess);
          api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('auth_change'));
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authAPI = {
  signup: (userData, config = {}) => api.post('/auth/signup/', userData, config),
  login: (credentials, config = {}) => api.post('/auth/login/', credentials, config),
  logout: (refreshToken, config = {}) => api.post('/auth/logout/', { refresh: refreshToken }, config),
  getProfile: (config = {}) => api.get('/auth/profile/', config),
  updateProfile: (profileData, config = {}) => api.put('/auth/profile/', profileData, config),
};

// Catalog Services
export const catalogAPI = {
  getBrands: (config = {}) => api.get('/brands/', config),
  getCategories: (brandSlug, config = {}) => api.get('/categories/', { params: { brand: brandSlug }, ...config }),
  getProducts: (params = {}, config = {}) => api.get('/products/', { params, ...config }),
  getProductBySlug: (slug, config = {}) => api.get(`/products/${slug}/`, config),
  
  // Admin Catalog Endpoints
  adminGetProducts: (params = {}, config = {}) => api.get('/catalog/admin/products/', { params, ...config }),
  adminGetProduct: (idOrSlug, config = {}) => api.get(`/catalog/admin/products/${idOrSlug}/`, config),
  adminCreateProduct: (productData, config = {}) => api.post('/catalog/admin/products/', productData, config),
  adminUpdateProduct: (idOrSlug, productData, config = {}) => api.put(`/catalog/admin/products/${idOrSlug}/`, productData, config),
  adminPatchProduct: (idOrSlug, productData, config = {}) => api.patch(`/catalog/admin/products/${idOrSlug}/`, productData, config),
  adminDeleteProduct: (idOrSlug, config = {}) => api.delete(`/catalog/admin/products/${idOrSlug}/`, config),
  adminUploadImage: (formData, config = {}) => api.post('/catalog/admin/upload-image/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  adminCreateCategory: (categoryData, config = {}) => api.post('/catalog/admin/categories/', categoryData, config),
  adminUpdateVariant: (variantId, variantData, config = {}) => api.patch(`/catalog/admin/variants/${variantId}/`, variantData, config),
  adminDeleteVariant: (variantId, config = {}) => api.delete(`/catalog/admin/variants/${variantId}/`, config),
};

// Cart Services
export const cartAPI = {
  getCart: () => api.get('/cart/'),
  addToCart: (variantId, quantity = 1) => api.post('/cart/add/', { variant_id: variantId, quantity }),
  updateCartItem: (itemId, quantity) => api.patch(`/cart/update/${itemId}/`, { quantity }),
  removeCartItem: (itemId) => api.delete(`/cart/remove/${itemId}/`),
  clearCart: () => api.delete('/cart/clear/'),
};

// Wishlist Services
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist/'),
  addToWishlist: (productId) => api.post('/wishlist/add/', { product_id: productId }),
  removeFromWishlist: (id) => api.delete(`/wishlist/remove/${id}/`),
};

// Orders Services
export const ordersAPI = {
  checkout: (orderData) => api.post('/orders/checkout/', orderData),
  getOrders: () => api.get('/orders/'),
  trackOrder: (params) => api.get('/orders/track/', { params }),
  getAdminOrders: (params = {}) => api.get('/orders/admin/all/', { params }),
  updateOrderStatus: (id, statusData) => api.patch(`/orders/${id}/status/`, typeof statusData === 'string' ? { status: statusData } : statusData),
  getOrderDetails: (id) => api.get(`/orders/${id}/`),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel/`),
  
  // Delivery Cities (Public & Admin)
  getDeliveryCities: (config = {}) => api.get('/orders/cities/', config),
  adminGetCities: (config = {}) => api.get('/orders/admin/cities/', config),
  adminCreateCity: (cityData, config = {}) => api.post('/orders/admin/cities/', cityData, config),
  adminUpdateCity: (id, cityData, config = {}) => api.patch(`/orders/admin/cities/${id}/`, cityData, config),
  adminDeleteCity: (id, config = {}) => api.delete(`/orders/admin/cities/${id}/`, config),
};


// Reviews Services (Public & Admin)
export const reviewsAPI = {
  // Public
  getPublicReviews: (params = {}, config = {}) => api.get('/reviews/', { params, ...config }),
  getReviews: (productSlugOrId, config = {}) => api.get('/reviews/', { params: { product: productSlugOrId }, ...config }),
  submitPublicReview: (reviewData, config = {}) => api.post('/reviews/submit/', reviewData, config),
  getProductReviews: (slug, config = {}) => api.get(`/products/${slug}/reviews/`, config),
  addProductReview: (slug, reviewData, config = {}) => api.post(`/products/${slug}/reviews/`, reviewData, config),
  
  // Admin Management
  adminGetReviews: (params = {}, config = {}) => api.get('/admin/reviews/', { params, ...config }),
  adminCreateReview: (reviewData, config = {}) => api.post('/admin/reviews/', reviewData, config),
  adminUpdateReview: (id, reviewData, config = {}) => api.patch(`/admin/reviews/${id}/`, reviewData, config),
  adminDeleteReview: (id, config = {}) => api.delete(`/admin/reviews/${id}/`, config),
  adminTogglePublish: (id, config = {}) => api.post(`/admin/reviews/${id}/toggle-publish/`, {}, config),
  adminToggleFeature: (id, config = {}) => api.post(`/admin/reviews/${id}/toggle-feature/`, {}, config),
};


// ERP Services (Staff / Admin)
export const erpAPI = {
  getAnalytics: () => api.get('/erp/analytics/'),
  getProducts: (brand) => api.get('/erp/products/', { params: { brand } }),
  getOrders: (params = {}) => api.get('/erp/orders/', { params }),
  updateOrderStatus: (id, status) => api.patch(`/erp/orders/${id}/status/`, { status }),
  adjustInventory: (variantId, quantity, reason) => api.post('/erp/inventory/adjust/', { variant_id: variantId, quantity, reason }),
};

// Store Settings & Banners Services (Public & Admin)
export const settingsAPI = {
  // Public
  getPublicSettings: (config = {}) => api.get('/settings/', config),

  // Admin
  adminGetSettings: (config = {}) => api.get('/catalog/admin/settings/', config),
  adminUpdateSettings: (settingsData, config = {}) => api.put('/catalog/admin/settings/', settingsData, config),
  adminPatchSettings: (settingsData, config = {}) => api.patch('/catalog/admin/settings/', settingsData, config),

  // Banners
  adminGetBanners: (config = {}) => api.get('/catalog/admin/banners/', config),
  adminCreateBanner: (bannerData, config = {}) => api.post('/catalog/admin/banners/', bannerData, config),
  adminUpdateBanner: (id, bannerData, config = {}) => api.put(`/catalog/admin/banners/${id}/`, bannerData, config),
  adminPatchBanner: (id, bannerData, config = {}) => api.patch(`/catalog/admin/banners/${id}/`, bannerData, config),
  adminDeleteBanner: (id, config = {}) => api.delete(`/catalog/admin/banners/${id}/`, config),
};

export default api;


