import AsyncStorage from '@react-native-async-storage/async-storage';

// Default API base URL - can be overridden by user settings
const DEFAULT_API_URL = 'http://localhost:5000/api';

/**
 * API client for making requests to the server with configurable base URL
 */
export const apiClient = {
  // Get the current API URL from storage or use default
  async getApiUrl() {
    try {
      const savedUrl = await AsyncStorage.getItem('api_base_url');
      return savedUrl || DEFAULT_API_URL;
    } catch (error) {
      console.error('Error getting API URL:', error);
      return DEFAULT_API_URL;
    }
  },

  // Set a custom API URL
  async setApiUrl(url) {
    try {
      await AsyncStorage.setItem('api_base_url', url);
    } catch (error) {
      console.error('Error setting API URL:', error);
    }
  },

  /**
   * Make a request to the API
   * @param {string} endpoint - The API endpoint to request
   * @param {Object} options - Request options (method, headers, body)
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    const baseUrl = await this.getApiUrl();
    const url = `${baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      method: options.method || 'GET',
      headers,
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (response.status === 204) {
        return null; // No content
      }
      
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        return Promise.reject(data);
      }
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      return Promise.reject(error);
    }
  },

  // Tenant endpoints
  tenants: {
    getPublicTenants: () => apiClient.request('/tenants/public'),
    getBrandSettings: (tenantId) => apiClient.request(`/brand?tenantId=${tenantId}`),
  },

  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.request('/login', { 
      method: 'POST', 
      body: credentials 
    }),
    register: (userData) => apiClient.request('/register', { 
      method: 'POST', 
      body: userData 
    }),
    logout: () => apiClient.request('/logout', { method: 'POST' }),
    getCurrentUser: () => apiClient.request('/user'),
  },

  // Wallet endpoints
  wallet: {
    getWallet: () => apiClient.request('/wallet'),
    addMoney: (data) => apiClient.request('/transactions/deposit', { 
      method: 'POST', 
      body: data 
    }),
    sendMoney: (data) => apiClient.request('/transactions/transfer', { 
      method: 'POST', 
      body: data 
    }),
    withdrawMoney: (data) => apiClient.request('/transactions/withdraw', { 
      method: 'POST', 
      body: data 
    }),
  },

  // Transaction endpoints
  transactions: {
    getAll: (customerId, limit = 20) => apiClient.request(`/transactions/${customerId}?limit=${limit}`),
  },

  // Card endpoints
  cards: {
    getAll: () => apiClient.request('/cards'),
    create: (cardData) => apiClient.request('/cards', { 
      method: 'POST', 
      body: cardData 
    }),
    update: (id, cardData) => apiClient.request(`/cards/${id}`, { 
      method: 'PATCH', 
      body: cardData 
    }),
    delete: (id) => apiClient.request(`/cards/${id}`, { 
      method: 'DELETE' 
    }),
  },

  // Prepaid card endpoints
  prepaidCards: {
    getAll: () => apiClient.request('/prepaid-cards'),
    getById: (id) => apiClient.request(`/prepaid-cards/${id}`),
    create: (cardData) => apiClient.request('/prepaid-cards', { 
      method: 'POST', 
      body: cardData 
    }),
  },

  // Carbon impact endpoints
  carbon: {
    getCategories: () => apiClient.request('/carbon/categories'),
    getPreferences: () => apiClient.request('/carbon/preferences'),
    updatePreferences: (data) => apiClient.request('/carbon/preferences', { 
      method: 'POST', 
      body: data 
    }),
    getImpacts: () => apiClient.request('/carbon/impacts'),
    getSummary: () => apiClient.request('/carbon/summary'),
    getOffsets: () => apiClient.request('/carbon/offsets'),
    createOffset: (data) => apiClient.request('/carbon/offsets', { 
      method: 'POST', 
      body: data 
    }),
  },
  
  // Budget endpoints
  budget: {
    getCategories: () => apiClient.request('/budget/categories'),
    getPlans: () => apiClient.request('/budget/plans'),
    getActivePlan: () => apiClient.request('/budget/plans/active'),
    createPlan: (planData) => apiClient.request('/budget/plans', { 
      method: 'POST', 
      body: planData 
    }),
    updatePlan: (id, planData) => apiClient.request(`/budget/plans/${id}`, { 
      method: 'PATCH', 
      body: planData 
    }),
    getAllocations: (planId) => apiClient.request(`/budget/plans/${planId}/allocations`),
    createAllocation: (planId, allocationData) => apiClient.request(`/budget/plans/${planId}/allocations`, { 
      method: 'POST', 
      body: allocationData 
    }),
    getTransactions: () => apiClient.request('/budget/transactions'),
  },
};