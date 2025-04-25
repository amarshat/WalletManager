import axios from 'axios';

export class PaysafeClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private brand: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  
  constructor() {
    this.baseUrl = process.env.PAYSAFE_BASE_URL || 'https://sandbox.paysafe.com';
    this.clientId = process.env.PAYSAFE_CLIENT_ID || 'b4d58fc7-382c-45dc-8547-79eb86d91176';
    this.clientSecret = process.env.PAYSAFE_CLIENT_SECRET || 'z75P72m3nhpG55DOPfPOkpOar9ynIZ87';
    this.brand = process.env.PAYSAFE_BRAND || 'dummy-us';
  }
  
  private async getToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) { // 1 minute buffer
      return this.accessToken;
    }
    
    // Otherwise, get a new token
    try {
      const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/digitalwallets/v1/auth/brands/${this.brand}/token`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authString}`
        },
        data: new URLSearchParams({
          'grant_type': 'client_credentials'
        })
      });
      
      this.accessToken = response.data.access_token;
      // Token expires in 900 seconds (15 minutes)
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Error obtaining access token:', error);
      throw new Error('Failed to get access token');
    }
  }
  
  private async makeApiRequest(method: string, endpoint: string, data?: any): Promise<any> {
    try {
      const token = await this.getToken();
      
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data
      });
      
      return response.data;
    } catch (error) {
      console.error(`API Error (${method} ${endpoint}):`, error);
      throw error;
    }
  }
  
  // Create a new wallet for a customer
  async createWallet(data: any): Promise<any> {
    return this.makeApiRequest('post', '/v2/wallets', data);
  }
  
  // Get balances for a customer
  async getBalances(customerId: string): Promise<any> {
    return this.makeApiRequest('get', `/v2/customers/${customerId}/accounts`);
  }
  
  // Deposit money to a wallet
  async depositMoney(data: { amount: number, currencyCode: string, customerId: string, description?: string }): Promise<any> {
    return this.makeApiRequest('post', '/v2/transactions/deposits', {
      amount: data.amount,
      currencyCode: data.currencyCode,
      customerId: data.customerId,
      description: data.description || 'Deposit'
    });
  }
  
  // Transfer money between wallets
  async transferMoney(data: { 
    amount: number, 
    currencyCode: string, 
    sourceCustomerId: string, 
    destinationCustomerId: string,
    note?: string
  }): Promise<any> {
    return this.makeApiRequest('post', '/v2/transactions/transfers', {
      amount: data.amount,
      currencyCode: data.currencyCode,
      sourceCustomerId: data.sourceCustomerId,
      destinationCustomerId: data.destinationCustomerId,
      note: data.note || 'Transfer'
    });
  }
  
  // Withdraw money from a wallet
  async withdrawMoney(data: {
    amount: number,
    currencyCode: string,
    customerId: string,
    description?: string
  }): Promise<any> {
    return this.makeApiRequest('post', '/v2/transactions/withdrawals', {
      amount: data.amount,
      currencyCode: data.currencyCode,
      customerId: data.customerId,
      description: data.description || 'Withdrawal'
    });
  }
  
  // Get transactions for a customer
  async getTransactions(customerId: string, limit: number = 10): Promise<any> {
    return this.makeApiRequest('get', `/v2/transactions?customerId=${customerId}&limit=${limit}`);
  }
  
  // Get customer profile
  async getCustomerProfile(customerId: string): Promise<any> {
    return this.makeApiRequest('get', `/v2/customer-persons/${customerId}`);
  }
}
