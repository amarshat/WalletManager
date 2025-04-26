import { PaysafeClient } from './paysafe';
import { phantomPayClient } from './phantompay';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Create a singleton instance of the Paysafe client
const paysafeClient = new PaysafeClient();

/**
 * WalletClient - A unified client that works with both Paysafe and PhantomPay
 * 
 * This client provides a consistent interface and automatically routes
 * requests to the appropriate implementation (real API or mock) based
 * on the user's configuration.
 */
export class WalletClient {
  /**
   * Determine if a user is configured to use PhantomPay
   */
  private async isPhantomUser(userId: number): Promise<boolean> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    return user?.isPhantomUser || false;
  }
  
  /**
   * Determine if a customer ID belongs to a PhantomPay wallet
   */
  private isPhantomCustomerId(customerId: string): boolean {
    return customerId.startsWith('phantom-');
  }
  
  /**
   * Create a new wallet for a user
   */
  async createWallet(userId: number, data: any): Promise<any> {
    const isPhantom = await this.isPhantomUser(userId);
    
    if (isPhantom) {
      console.log('[WalletClient] Using PhantomPay for wallet creation');
      // Add the userId to the customer object 
      const phantomData = {
        ...data,
        customer: {
          ...data.customer,
          id: userId.toString() // Add the userId as a string to ensure it's passed to PhantomPay
        }
      };
      return phantomPayClient.createWallet(phantomData);
    } else {
      console.log('[WalletClient] Using Paysafe API for wallet creation');
      return paysafeClient.createWallet(data);
    }
  }
  
  /**
   * Get balances for a customer
   */
  async getBalances(customerId: string): Promise<any> {
    if (this.isPhantomCustomerId(customerId)) {
      console.log('[WalletClient] Using PhantomPay for getBalances');
      return phantomPayClient.getBalances(customerId);
    } else {
      console.log('[WalletClient] Using Paysafe API for getBalances');
      return paysafeClient.getBalances(customerId);
    }
  }
  
  /**
   * Deposit money into a wallet
   */
  async depositMoney(data: { amount: number, currencyCode: string, customerId: string, description?: string }): Promise<any> {
    if (this.isPhantomCustomerId(data.customerId)) {
      console.log('[WalletClient] Using PhantomPay for deposit');
      return phantomPayClient.depositMoney(data);
    } else {
      console.log('[WalletClient] Using Paysafe API for deposit');
      return paysafeClient.depositMoney(data);
    }
  }
  
  /**
   * Transfer money between wallets
   */
  async transferMoney(data: { 
    amount: number, 
    currencyCode: string, 
    sourceCustomerId: string, 
    destinationCustomerId: string,
    note?: string
  }): Promise<any> {
    // Both source and destination must be of the same type
    const sourceIsPhantom = this.isPhantomCustomerId(data.sourceCustomerId);
    const destIsPhantom = this.isPhantomCustomerId(data.destinationCustomerId);
    
    if (sourceIsPhantom !== destIsPhantom) {
      throw new Error(
        'Cross-system transfers are not allowed. PhantomPay users can only transfer to other PhantomPay users, ' +
        'and Paysafe users can only transfer to other Paysafe users.'
      );
    }
    
    if (sourceIsPhantom) {
      console.log('[WalletClient] Using PhantomPay for transfer');
      return phantomPayClient.transferMoney(data);
    } else {
      console.log('[WalletClient] Using Paysafe API for transfer');
      return paysafeClient.transferMoney(data);
    }
  }
  
  /**
   * Withdraw money from a wallet
   */
  async withdrawMoney(data: {
    amount: number,
    currencyCode: string,
    customerId: string,
    description?: string
  }): Promise<any> {
    if (this.isPhantomCustomerId(data.customerId)) {
      console.log('[WalletClient] Using PhantomPay for withdrawal');
      return phantomPayClient.withdrawMoney(data);
    } else {
      console.log('[WalletClient] Using Paysafe API for withdrawal');
      return paysafeClient.withdrawMoney(data);
    }
  }
  
  /**
   * Get transactions for a customer
   */
  async getTransactions(customerId: string, limit: number = 10): Promise<any> {
    if (this.isPhantomCustomerId(customerId)) {
      console.log('[WalletClient] Using PhantomPay for getTransactions');
      return phantomPayClient.getTransactions(customerId, limit);
    } else {
      console.log('[WalletClient] Using Paysafe API for getTransactions');
      return paysafeClient.getTransactions(customerId, limit);
    }
  }
  
  /**
   * Get customer profile
   */
  async getCustomerProfile(customerId: string): Promise<any> {
    if (this.isPhantomCustomerId(customerId)) {
      console.log('[WalletClient] Using PhantomPay for getCustomerProfile');
      return phantomPayClient.getCustomerProfile(customerId);
    } else {
      console.log('[WalletClient] Using Paysafe API for getCustomerProfile');
      return paysafeClient.getCustomerProfile(customerId);
    }
  }
}

// Create a singleton instance
export const walletClient = new WalletClient();