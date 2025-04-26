import { db } from './db';
import { 
  users, 
  phantomWallets, 
  phantomAccounts, 
  phantomTransactions,
  type PhantomWallet,
  type PhantomAccount,
  type PhantomTransaction 
} from '@shared/schema';
import { 
  and, 
  eq, 
  desc, 
  or, 
  sql,
  inArray
} from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * PhantomPay - A mock payment system for digital wallets
 * 
 * This class mimics the Paysafe API but uses a local database to store
 * mock wallets, accounts, and transactions.
 */
export class PhantomPayClient {
  // Generate a unique ID with a phantom- prefix
  private generateId(prefix: string): string {
    return `phantom-${prefix}-${randomUUID().substring(0, 8)}`;
  }

  /**
   * Create a new PhantomPay wallet for a user
   */
  async createWallet(data: { customer: { firstName: string, lastName: string, email?: string, dateOfBirth?: string, nationalId?: string, id?: string } }): Promise<any> {
    try {
      // We would normally validate the customer data here

      // Generate a wallet ID
      const walletId = this.generateId('wallet');
      
      // We need a userId for the wallet creation
      // In the wallet-client.ts, we're passing an explicit userId from routes.ts
      // which we'll extract from the customer.id field
      let userId: number;
      if (data.customer.id) {
        // If an ID is provided (from wallet-client.ts), use it
        userId = parseInt(data.customer.id);
        
        // Update the user to mark as phantom user
        await db.update(users)
          .set({ 
            isPhantomUser: true,
            phantomUserId: walletId
          })
          .where(eq(users.id, userId))
          .execute();
      } else if (data.customer.email) {
        // Legacy path - find by email if provided
        const user = await db.query.users.findFirst({
          where: eq(users.email, data.customer.email)
        });
        if (!user) {
          throw new Error('User not found with the provided email');
        }
        userId = user.id;
        
        // Update the user to mark as phantom user
        await db.update(users)
          .set({ 
            isPhantomUser: true,
            phantomUserId: walletId
          })
          .where(eq(users.id, userId))
          .execute();
      } else {
        throw new Error('Either user ID or email is required for wallet creation');
      }
      
      // Create the phantom wallet
      const [wallet] = await db.insert(phantomWallets)
        .values({
          userId,
          walletId,
          status: 'ACTIVE'
        })
        .returning();
      
      // Create default accounts for each supported currency
      const currencies = ['USD', 'EUR', 'GBP', 'CAD'];
      for (const currency of currencies) {
        await db.insert(phantomAccounts)
          .values({
            phantomWalletId: wallet.id,
            accountId: this.generateId('acct'),
            currencyCode: currency,
            balance: 0
          })
          .execute();
      }
      
      return {
        id: walletId,
        customerId: walletId,
        status: 'ACTIVE',
        customer: {
          id: walletId,
          firstName: data.customer.firstName,
          lastName: data.customer.lastName,
          email: data.customer.email,
          dateOfBirth: data.customer.dateOfBirth || null,
          nationalId: data.customer.nationalId || null
        },
        accounts: currencies.map(code => ({
          id: this.generateId('acct'),
          currencyCode: code,
          balance: 0
        }))
      };
    } catch (error: any) {
      console.error('PhantomPay Create Wallet Error:', error);
      throw new Error(`PhantomPay wallet creation failed: ${error.message}`);
    }
  }
  
  /**
   * Get balances for all accounts in a wallet
   */
  async getBalances(customerId: string): Promise<any> {
    try {
      // Find the wallet
      const wallet = await db.query.phantomWallets.findFirst({
        where: eq(phantomWallets.walletId, customerId)
      });
      
      if (!wallet) {
        throw new Error(`Wallet not found for customer ID: ${customerId}`);
      }
      
      // Get all accounts for this wallet
      const accounts = await db.query.phantomAccounts.findMany({
        where: eq(phantomAccounts.phantomWalletId, wallet.id)
      });
      
      return {
        accounts: accounts.map(account => ({
          id: account.accountId,
          currencyCode: account.currencyCode,
          balance: (account.balance || 0), // No conversion needed - keep as is
          status: 'ACTIVE'
        }))
      };
    } catch (error: any) {
      console.error('PhantomPay Get Balances Error:', error);
      throw new Error(`PhantomPay get balances failed: ${error.message}`);
    }
  }
  
  /**
   * Deposit money into a wallet
   */
  async depositMoney(data: { amount: number, currencyCode: string, customerId: string, description?: string }): Promise<any> {
    try {
      // Ensure amount is a valid number
      let amount = data.amount;
      
      // If amount is a string, convert it to a number
      if (typeof amount === 'string') {
        amount = parseFloat(amount);
      }
      
      // Validate the amount
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a valid number greater than zero');
      }
      
      // Find the wallet
      const wallet = await db.query.phantomWallets.findFirst({
        where: eq(phantomWallets.walletId, data.customerId)
      });
      
      if (!wallet) {
        throw new Error(`Wallet not found for customer ID: ${data.customerId}`);
      }
      
      // Find the account for this currency
      const account = await db.query.phantomAccounts.findFirst({
        where: and(
          eq(phantomAccounts.phantomWalletId, wallet.id),
          eq(phantomAccounts.currencyCode, data.currencyCode)
        )
      });
      
      if (!account) {
        throw new Error(`Account not found for currency: ${data.currencyCode}`);
      }
      
      // Ensure we're working with a valid decimal amount
      let decimalAmount;
      try {
        decimalAmount = Number(amount);
        if (isNaN(decimalAmount)) {
          throw new Error(`Cannot convert "${amount}" to a number`);
        }
        // Format to 2 decimal places but keep as number
        decimalAmount = parseFloat(decimalAmount.toFixed(2));
      } catch (err) {
        console.error(`Error converting amount: ${amount} of type ${typeof amount} to decimal`);
        throw new Error(`Invalid amount: ${amount}. Must be a valid number.`);
      }
      
      console.log('Processing deposit amount:', { 
        original: data.amount, 
        parsed: amount,
        final: decimalAmount,
        finalType: typeof decimalAmount
      });
      
      // Update account balance - ensure we're using numbers not strings
      const currentBalance = Number(account.balance || 0);
      const newBalance = parseFloat((currentBalance + decimalAmount).toFixed(2));
      
      console.log('Balance calculation:', {
        currentBalance,
        amountToAdd: decimalAmount,
        newBalance,
        currentBalanceType: typeof currentBalance,
        newBalanceType: typeof newBalance
      });
      
      await db.update(phantomAccounts)
        .set({ balance: newBalance })
        .where(eq(phantomAccounts.id, account.id))
        .execute();
      
      // Create transaction record
      const transactionId = this.generateId('tx');
      console.log('Creating transaction with amount:', {
        amount: amountInInteger,
        type: typeof amountInInteger
      });
      
      // Create the values object with strict typing
      const transactionValues = {
        transactionId,
        destinationAccountId: account.id,
        amount: amountInInteger,
        currencyCode: data.currencyCode,
        type: 'DEPOSIT' as const,
        note: data.description || 'Deposit',
        status: 'COMPLETED' as const
      };
      
      await db.insert(phantomTransactions)
        .values(transactionValues)
        .execute();
      
      return {
        id: transactionId,
        customerId: data.customerId,
        accountId: account.accountId,
        amount: amountInInteger, // Return the processed amount
        currencyCode: data.currencyCode,
        type: 'DEPOSIT',
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('PhantomPay Deposit Error:', error);
      throw new Error(`PhantomPay deposit failed: ${error.message}`);
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
    try {
      // Ensure amount is a valid number
      let amount = data.amount;
      
      // If amount is a string, convert it to a number
      if (typeof amount === 'string') {
        amount = parseFloat(amount);
      }
      
      // Validate the amount
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a valid number greater than zero');
      }
      
      // Find the source wallet
      const sourceWallet = await db.query.phantomWallets.findFirst({
        where: eq(phantomWallets.walletId, data.sourceCustomerId)
      });
      
      if (!sourceWallet) {
        throw new Error(`Source wallet not found for customer ID: ${data.sourceCustomerId}`);
      }
      
      // Find the destination wallet
      const destWallet = await db.query.phantomWallets.findFirst({
        where: eq(phantomWallets.walletId, data.destinationCustomerId)
      });
      
      if (!destWallet) {
        throw new Error(`Destination wallet not found for customer ID: ${data.destinationCustomerId}`);
      }
      
      // Find source account for this currency
      const sourceAccount = await db.query.phantomAccounts.findFirst({
        where: and(
          eq(phantomAccounts.phantomWalletId, sourceWallet.id),
          eq(phantomAccounts.currencyCode, data.currencyCode)
        )
      });
      
      if (!sourceAccount) {
        throw new Error(`Source account not found for currency: ${data.currencyCode}`);
      }
      
      // Find destination account for this currency
      const destAccount = await db.query.phantomAccounts.findFirst({
        where: and(
          eq(phantomAccounts.phantomWalletId, destWallet.id),
          eq(phantomAccounts.currencyCode, data.currencyCode)
        )
      });
      
      if (!destAccount) {
        throw new Error(`Destination account not found for currency: ${data.currencyCode}`);
      }
      
      // Ensure we're working with an integer amount (no decimals)
      // Use Math.round to handle any decimal points
      const amountInInteger = Math.round(amount);
      console.log('Processing transfer amount:', { 
        original: data.amount, 
        parsed: amount,
        final: amountInInteger 
      });
      
      // Check if source has enough balance
      if ((sourceAccount.balance || 0) < amountInInteger) {
        throw new Error('Insufficient funds for transfer');
      }
      
      // Update source account balance
      await db.update(phantomAccounts)
        .set({ balance: (sourceAccount.balance || 0) - amountInInteger })
        .where(eq(phantomAccounts.id, sourceAccount.id))
        .execute();
      
      // Update destination account balance
      await db.update(phantomAccounts)
        .set({ balance: (destAccount.balance || 0) + amountInInteger })
        .where(eq(phantomAccounts.id, destAccount.id))
        .execute();
      
      // Create transaction record
      const transactionId = this.generateId('tx');
      await db.insert(phantomTransactions)
        .values({
          transactionId,
          sourceAccountId: sourceAccount.id,
          destinationAccountId: destAccount.id,
          amount: amountInInteger,
          currencyCode: data.currencyCode,
          type: 'TRANSFER',
          note: data.note || 'Transfer',
          status: 'COMPLETED'
        })
        .execute();
      
      return {
        id: transactionId,
        sourceCustomerId: data.sourceCustomerId,
        destinationCustomerId: data.destinationCustomerId,
        sourceAccountId: sourceAccount.accountId,
        destinationAccountId: destAccount.accountId,
        amount: amountInInteger, // Return the processed amount
        currencyCode: data.currencyCode,
        type: 'TRANSFER',
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('PhantomPay Transfer Error:', error);
      throw new Error(`PhantomPay transfer failed: ${error.message}`);
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
    try {
      // Ensure amount is a valid number
      let amount = data.amount;
      
      // If amount is a string, convert it to a number
      if (typeof amount === 'string') {
        amount = parseFloat(amount);
      }
      
      // Validate the amount
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a valid number greater than zero');
      }
      
      // Find the wallet
      const wallet = await db.query.phantomWallets.findFirst({
        where: eq(phantomWallets.walletId, data.customerId)
      });
      
      if (!wallet) {
        throw new Error(`Wallet not found for customer ID: ${data.customerId}`);
      }
      
      // Find the account for this currency
      const account = await db.query.phantomAccounts.findFirst({
        where: and(
          eq(phantomAccounts.phantomWalletId, wallet.id),
          eq(phantomAccounts.currencyCode, data.currencyCode)
        )
      });
      
      if (!account) {
        throw new Error(`Account not found for currency: ${data.currencyCode}`);
      }
      
      // Ensure we're working with an integer amount (no decimals)
      // Use Math.round to handle any decimal points
      const amountInInteger = Math.round(amount);
      console.log('Processing withdrawal amount:', { 
        original: data.amount, 
        parsed: amount,
        final: amountInInteger 
      });
      
      // Check if account has enough balance
      if ((account.balance || 0) < amountInInteger) {
        throw new Error('Insufficient funds for withdrawal');
      }
      
      // Update account balance
      await db.update(phantomAccounts)
        .set({ balance: (account.balance || 0) - amountInInteger })
        .where(eq(phantomAccounts.id, account.id))
        .execute();
      
      // Create transaction record
      const transactionId = this.generateId('tx');
      await db.insert(phantomTransactions)
        .values({
          transactionId,
          sourceAccountId: account.id,
          amount: amountInInteger,
          currencyCode: data.currencyCode,
          type: 'WITHDRAWAL',
          note: data.description || 'Withdrawal',
          status: 'COMPLETED'
        })
        .execute();
      
      return {
        id: transactionId,
        customerId: data.customerId,
        accountId: account.accountId,
        amount: amountInInteger, // Return the processed amount
        currencyCode: data.currencyCode,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('PhantomPay Withdrawal Error:', error);
      throw new Error(`PhantomPay withdrawal failed: ${error.message}`);
    }
  }
  
  /**
   * Get transactions for a customer
   */
  async getTransactions(customerId: string, limit: number = 10): Promise<any> {
    try {
      // Find the wallet
      const wallet = await db.query.phantomWallets.findFirst({
        where: eq(phantomWallets.walletId, customerId)
      });
      
      if (!wallet) {
        throw new Error(`Wallet not found for customer ID: ${customerId}`);
      }
      
      // Get all accounts for this wallet
      const accounts = await db.query.phantomAccounts.findMany({
        where: eq(phantomAccounts.phantomWalletId, wallet.id)
      });
      
      if (accounts.length === 0) {
        return { transactions: [] };
      }
      
      // Get account IDs
      const accountIds = accounts.map(account => account.id);
      
      // Use individual OR conditions for each account ID
      let whereCondition = undefined;
      for (const accountId of accountIds) {
        const condition = or(
          eq(phantomTransactions.sourceAccountId, accountId),
          eq(phantomTransactions.destinationAccountId, accountId)
        );
        whereCondition = whereCondition ? or(whereCondition, condition) : condition;
      }
      
      // Find all transactions that involve any of these accounts
      const transactions = await db.query.phantomTransactions.findMany({
        where: whereCondition,
        orderBy: [desc(phantomTransactions.createdAt)],
        limit
      });
      
      // Create a map of account IDs to account details for quick lookup
      const accountMap = new Map<number, PhantomAccount>();
      for (const account of accounts) {
        accountMap.set(account.id, account);
      }
      
      return {
        transactions: await Promise.all(transactions.map(async tx => {
          // Get account details for display
          const sourceAccount = tx.sourceAccountId ? accountMap.get(tx.sourceAccountId) : undefined;
          const destAccount = tx.destinationAccountId ? accountMap.get(tx.destinationAccountId) : undefined;
          
          return {
            id: tx.transactionId,
            type: tx.type,
            status: tx.status,
            amount: tx.amount, // No conversion needed, keep as is
            currencyCode: tx.currencyCode,
            sourceAccountId: sourceAccount?.accountId,
            destinationAccountId: destAccount?.accountId,
            note: tx.note,
            createdAt: tx.createdAt?.toISOString()
          };
        }))
      };
    } catch (error: any) {
      console.error('PhantomPay Get Transactions Error:', error);
      throw new Error(`PhantomPay get transactions failed: ${error.message}`);
    }
  }
  
  /**
   * Get customer profile
   */
  async getCustomerProfile(customerId: string): Promise<any> {
    try {
      // Find the wallet
      const wallet = await db.query.phantomWallets.findFirst({
        where: eq(phantomWallets.walletId, customerId)
      });
      
      if (!wallet) {
        throw new Error(`Wallet not found for customer ID: ${customerId}`);
      }
      
      // Get the user
      const user = await db.query.users.findFirst({
        where: eq(users.id, wallet.userId)
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        id: customerId,
        firstName: user.fullName.split(' ')[0],
        lastName: user.fullName.split(' ').slice(1).join(' '),
        email: user.email,
        status: 'ACTIVE',
        type: 'PHANTOM',
        createdAt: wallet.createdAt?.toISOString()
      };
    } catch (error: any) {
      console.error('PhantomPay Get Customer Profile Error:', error);
      throw new Error(`PhantomPay get customer profile failed: ${error.message}`);
    }
  }
}

// Create a singleton instance
export const phantomPayClient = new PhantomPayClient();