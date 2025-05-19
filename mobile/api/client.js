import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - change this to your server URL when deploying
const API_URL = 'https://paysage-wallet.example.com/api';

/**
 * API client for making requests to the server
 */
export const apiClient = {
  /**
   * Make a request to the API
   * @param {string} endpoint - The API endpoint to request
   * @param {Object} options - Request options (method, headers, body)
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    
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
    getBalance: () => apiClient.request('/wallet/balance'),
    getAccounts: () => apiClient.request('/wallet/accounts'),
    addMoney: (data) => apiClient.request('/wallet/deposit', { 
      method: 'POST', 
      body: data 
    }),
    sendMoney: (data) => apiClient.request('/wallet/transfer', { 
      method: 'POST', 
      body: data 
    }),
    withdrawMoney: (data) => apiClient.request('/wallet/withdraw', { 
      method: 'POST', 
      body: data 
    }),
  },

  // Transaction endpoints
  transactions: {
    getAll: (limit = 20) => apiClient.request(`/transactions?limit=${limit}`),
    getById: (id) => apiClient.request(`/transactions/${id}`),
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