import axios from 'axios';

export class PaysafeClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private brand: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  
  constructor() {
    this.baseUrl = process.env.PAYSAFE_BASE_URL || 'https://sandbox.paysafe.com/digitalwallets';
    this.clientId = process.env.PAYSAFE_CLIENT_ID || 'b4d58fc7-382c-45dc-8547-79eb86d91176';
    this.clientSecret = process.env.PAYSAFE_CLIENT_SECRET || 'z75P72m3nhpG55DOPfPOkpOar9ynIZ87';
    this.brand = process.env.PAYSAFE_BRAND || 'dummy-us';
  }
  
  async getToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) { // 1 minute buffer
      console.log('[Paysafe Auth] Using cached token (expires in', 
        Math.round((this.tokenExpiry - Date.now()) / 1000 / 60), 'minutes)');
      return this.accessToken as string;
    }
    
    // Otherwise, get a new token
    try {
      console.log('\n[Paysafe Auth] Requesting new access token...');
      console.log(`[Paysafe Auth] URL: ${this.baseUrl}/v1/auth/brands/${this.brand}/token`);
      
      const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const maskedAuthString = authString.substring(0, 10) + '...' + authString.substring(authString.length - 5);
      console.log(`[Paysafe Auth] Basic Auth: Basic ${maskedAuthString}`);
      
      // Generate and log equivalent curl command
      const curlCommand = `curl --location '${this.baseUrl}/v1/auth/brands/${this.brand}/token' \\\n` +
        `  --header 'Content-Type: application/x-www-form-urlencoded' \\\n` +
        `  --header 'Authorization: Basic ${maskedAuthString}' \\\n` +
        `  --data 'grant_type=client_credentials'`;
      
      console.log('\n[Paysafe Auth] Equivalent cURL command:');
      console.log(curlCommand);
      
      console.log('\n[Paysafe Auth] Sending request...');
      
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/v1/auth/brands/${this.brand}/token`,
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
      
      // Mask token for logging
      const maskedToken = this.accessToken.substring(0, 10) + '...' + this.accessToken.substring(this.accessToken.length - 5);
      
      console.log(`[Paysafe Auth] Token obtained successfully`);
      console.log(`[Paysafe Auth] Token: ${maskedToken}`);
      console.log(`[Paysafe Auth] Expires in: ${response.data.expires_in} seconds`);
      console.log(`[Paysafe Auth] Token type: ${response.data.token_type}`);
      
      return this.accessToken as string;
    } catch (error: any) {
      console.error('\n[Paysafe Auth] Error obtaining access token:', error.message);
      
      // Enhanced error logging
      if (error.response) {
        console.error(`[Paysafe Auth] Response Status: ${error.response.status}`);
        console.error(`[Paysafe Auth] Response Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
        console.error(`[Paysafe Auth] Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        console.error('[Paysafe Auth] No response received. Request details:', error.request);
      }
      
      throw new Error('Failed to get access token: ' + error.message);
    }
  }
  
  // Helper to log the request details as curl
  private formatAsCurl(method: string, url: string, headers: Record<string, string>, data?: any): string {
    let curl = `curl --location '${url}' \\\n`;
    
    // Add headers
    Object.entries(headers).forEach(([key, value]) => {
      curl += `  --header '${key}: ${value.length > 50 ? value.substring(0, 10) + '...' + value.substring(value.length - 5) : value}' \\\n`;
    });
    
    // Add data if present
    if (data) {
      curl += `  --data '${JSON.stringify(data)}' \\\n`;
    }
    
    return curl.slice(0, -3); // Remove the last backslash and newline
  }
  
  private async makeApiRequest(method: string, endpoint: string, data?: any): Promise<any> {
    try {
      const token = await this.getToken();
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Log request details
      console.log(`\n[Paysafe API Request] ${method.toUpperCase()} ${url}`);
      console.log(`Headers: ${JSON.stringify(headers, (key, value) => {
        // Mask the token value in Authorization header
        if (key === 'Authorization' && typeof value === 'string') {
          return value.substring(0, 15) + '...' + value.substring(value.length - 5);
        }
        return value;
      }, 2)}`);
      
      if (data) {
        console.log(`Request Data: ${JSON.stringify(data, null, 2)}`);
      }
      
      // Generate and log curl
      const curlCommand = this.formatAsCurl(method, url, headers, data);
      console.log('Equivalent cURL command:');
      console.log(curlCommand);
      
      const response = await axios({
        method,
        url,
        headers,
        data
      });
      
      // Log response
      console.log(`[Paysafe API Response] Status: ${response.status}`);
      console.log(`Response data: ${JSON.stringify(response.data, null, 2)}`);
      
      return response.data;
    } catch (error: any) {
      console.error(`API Error (${method} ${endpoint}):`, error.message);
      
      // Enhanced error logging
      if (error.response) {
        console.error(`Response Status: ${error.response.status}`);
        console.error(`Response Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
        console.error(`Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        console.error('No response received. Request details:', error.request);
      }
      
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
