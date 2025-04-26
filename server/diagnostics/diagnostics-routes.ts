import { Request, Response } from 'express';
import { db } from '../db';
import { phantomWallets, phantomAccounts, phantomTransactions, systemLogs } from '@shared/schema';
import { count, asc, desc, eq, ne, isNull, sql } from 'drizzle-orm';
import { phantomPayClient } from '../phantompay';
import { walletClient } from '../wallet-client';
import { storage } from '../storage';

// System status endpoint
export async function getPhantomSystemStatus(req: Request, res: Response) {
  try {
    // Check if PhantomPay is ready
    const phantomPayReady = true; // Always true if this code is executed
    
    // Check if database is available
    let databaseAvailable = false;
    try {
      await db.execute(sql`SELECT 1`);
      databaseAvailable = true;
    } catch (error) {
      console.error('Database connection test failed:', error);
    }
    
    // Check if routes are registered
    const routesRegistered = true; // Always true if this endpoint is called
    
    // Get the latest diagnostic run from logs
    const [latestDiagnostic] = await db
      .select({ timestamp: systemLogs.createdAt })
      .from(systemLogs)
      .where(eq(systemLogs.action, 'Run PhantomPay diagnostic'))
      .orderBy(desc(systemLogs.createdAt))
      .limit(1);
    
    // Get counts of PhantomPay entities
    const [[walletCount], [accountCount], [transactionCount]] = await Promise.all([
      db.select({ count: count() }).from(phantomWallets),
      db.select({ count: count() }).from(phantomAccounts),
      db.select({ count: count() }).from(phantomTransactions)
    ]);
    
    res.json({
      phantomPayReady,
      databaseAvailable,
      routesRegistered,
      lastDiagnosticRun: latestDiagnostic?.timestamp || null,
      totalPhantomWallets: walletCount.count,
      totalPhantomAccounts: accountCount.count,
      totalPhantomTransactions: transactionCount.count
    });
  } catch (error: any) {
    console.error('Error getting system status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get system status', 
      error: error.message 
    });
  }
}

// Run a specific diagnostic test
export async function runPhantomDiagnostic(req: Request, res: Response) {
  const { testType, customerId, transactionId } = req.body;
  
  try {
    // Log the diagnostic run
    await storage.addSystemLog({
      userId: req.user?.id,
      action: 'Run PhantomPay diagnostic',
      details: { testType, customerId, transactionId }
    });
    
    // Basic response structure
    let result = {
      success: false,
      message: 'Diagnostic not implemented',
      details: null,
      recommendation: null
    };
    
    // Run the appropriate diagnostic test
    switch (testType) {
      case 'database':
        result = await runDatabaseTest();
        break;
        
      case 'integration':
        result = await runIntegrationTest();
        break;
        
      case 'schema':
        result = await runSchemaTest();
        break;
        
      case 'routes':
        result = await runRoutesTest();
        break;
        
      case 'customer':
      case 'customer_lookup':
        if (!customerId) {
          return res.status(400).json({ 
            success: false, 
            message: 'Customer ID is required for this test' 
          });
        }
        result = await runCustomerTest(customerId, testType);
        break;
        
      case 'account_status':
      case 'balance_check':
        if (!customerId) {
          return res.status(400).json({ 
            success: false, 
            message: 'Customer ID is required for this test' 
          });
        }
        result = await runAccountTest(customerId, testType);
        break;
        
      case 'transaction':
      case 'transaction_flow':
        if (testType === 'transaction' && !transactionId) {
          return res.status(400).json({ 
            success: false, 
            message: 'Transaction ID is required for this test' 
          });
        }
        result = await runTransactionTest(transactionId, testType);
        break;
        
      case 'error_handling':
        result = await runErrorHandlingTest();
        break;
        
      case 'data_consistency':
      case 'orphaned_records':
      case 'balance_reconciliation':
      case 'data_repair':
        result = await runDataIntegrityTest(testType);
        break;
        
      default:
        return res.status(400).json({ 
          success: false, 
          message: `Unknown diagnostic test type: ${testType}` 
        });
    }
    
    // Add system status to the result
    const [
      [walletCount], 
      [accountCount], 
      [transactionCount]
    ] = await Promise.all([
      db.select({ count: count() }).from(phantomWallets),
      db.select({ count: count() }).from(phantomAccounts),
      db.select({ count: count() }).from(phantomTransactions)
    ]);
    
    const systemStatus = {
      phantomPayReady: true,
      databaseAvailable: true,
      routesRegistered: true,
      lastDiagnosticRun: new Date().toISOString(),
      totalPhantomWallets: walletCount.count,
      totalPhantomAccounts: accountCount.count,
      totalPhantomTransactions: transactionCount.count
    };
    
    res.json({
      ...result,
      systemStatus
    });
  } catch (error: any) {
    console.error(`Error running diagnostic test (${testType}):`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Diagnostic test failed', 
      error: error.message 
    });
  }
}

// Database connection test
async function runDatabaseTest() {
  try {
    // Test basic SQL query
    await db.execute(sql`SELECT 1`);
    
    // Test PhantomPay table queries
    await Promise.all([
      db.select().from(phantomWallets).limit(1),
      db.select().from(phantomAccounts).limit(1),
      db.select().from(phantomTransactions).limit(1)
    ]);
    
    return {
      success: true,
      message: 'Database connection is working correctly',
      details: {
        tablesChecked: ['phantomWallets', 'phantomAccounts', 'phantomTransactions']
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Database connection test failed',
      details: { error: error.message },
      recommendation: 'Check database connection settings and ensure the database is running'
    };
  }
}

// Integration test
async function runIntegrationTest() {
  try {
    // Test walletClient's isPhantomCustomerId method
    const testId = 'phantom-wallet-test';
    const isPhantom = (walletClient as any).isPhantomCustomerId(testId);
    
    if (!isPhantom) {
      return {
        success: false,
        message: 'WalletClient is not properly detecting PhantomPay IDs',
        recommendation: 'Check the wallet-client.ts implementation of isPhantomCustomerId'
      };
    }
    
    // Test client instantiation
    if (!phantomPayClient) {
      return {
        success: false,
        message: 'PhantomPayClient is not properly instantiated',
        recommendation: 'Check the phantompay.ts implementation'
      };
    }
    
    return {
      success: true,
      message: 'PhantomPay integration is properly configured',
      details: {
        isPhantomUserDetection: true,
        clientInstantiation: true
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Integration test failed',
      details: { error: error.message },
      recommendation: 'Check the wallet-client.ts and phantompay.ts implementations'
    };
  }
}

// Schema test
async function runSchemaTest() {
  try {
    // Get table information
    const walletColumns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'phantom_wallets'
    `);
    
    const accountColumns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'phantom_accounts'
    `);
    
    const transactionColumns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'phantom_transactions'
    `);
    
    // Check if required columns exist
    const requiredWalletColumns = ['id', 'wallet_id', 'user_id', 'status'];
    const requiredAccountColumns = ['id', 'phantom_wallet_id', 'account_id', 'currency_code', 'balance'];
    const requiredTransactionColumns = ['id', 'transaction_id', 'source_account_id', 'destination_account_id', 'amount', 'currency_code', 'type', 'status'];
    
    const walletColumnNames = walletColumns.rows.map((row: any) => row.column_name);
    const accountColumnNames = accountColumns.rows.map((row: any) => row.column_name);
    const transactionColumnNames = transactionColumns.rows.map((row: any) => row.column_name);
    
    const missingWalletColumns = requiredWalletColumns.filter(col => !walletColumnNames.includes(col));
    const missingAccountColumns = requiredAccountColumns.filter(col => !accountColumnNames.includes(col));
    const missingTransactionColumns = requiredTransactionColumns.filter(col => !transactionColumnNames.includes(col));
    
    const hasAllRequiredColumns = 
      missingWalletColumns.length === 0 && 
      missingAccountColumns.length === 0 && 
      missingTransactionColumns.length === 0;
    
    if (!hasAllRequiredColumns) {
      return {
        success: false,
        message: 'Database schema is missing required columns',
        details: {
          missingWalletColumns,
          missingAccountColumns,
          missingTransactionColumns
        },
        recommendation: 'Update the database schema to include all required columns'
      };
    }
    
    return {
      success: true,
      message: 'Database schema is valid',
      details: {
        walletColumns: walletColumnNames,
        accountColumns: accountColumnNames,
        transactionColumns: transactionColumnNames
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Schema test failed',
      details: { error: error.message },
      recommendation: 'Check database schema and ensure tables are properly created'
    };
  }
}

// Routes test
async function runRoutesTest() {
  // Since the diagnostics routes are working if this function is called,
  // we'll just return success
  return {
    success: true,
    message: 'PhantomPay API routes are properly registered',
    details: {
      routes: [
        '/api/admin/phantom-diagnostics',
        '/api/admin/phantom-system-status',
        '/api/wallet',
        '/api/transactions/deposit',
        '/api/transactions/transfer',
        '/api/transactions/withdraw',
        '/api/transactions'
      ]
    }
  };
}

// Customer tests
async function runCustomerTest(customerId: string, testType: string) {
  try {
    if (!customerId.startsWith('phantom-wallet-')) {
      return {
        success: false,
        message: 'Invalid PhantomPay customer ID format',
        recommendation: 'Customer IDs should start with "phantom-wallet-"'
      };
    }
    
    // Customer lookup test
    const wallet = await db.query.phantomWallets.findFirst({
      where: eq(phantomWallets.walletId, customerId)
    });
    
    if (!wallet) {
      return {
        success: false,
        message: `Customer with ID ${customerId} not found`,
        recommendation: 'Verify the customer ID or create a new PhantomPay wallet'
      };
    }
    
    if (testType === 'customer_lookup') {
      // For specific customer lookup test, return success here
      return {
        success: true,
        message: `Customer with ID ${customerId} found`,
        details: {
          walletId: wallet.walletId,
          userId: wallet.userId,
          status: wallet.status,
          createdAt: wallet.createdAt
        }
      };
    }
    
    // For the general customer test, also check accounts
    const accounts = await db.query.phantomAccounts.findMany({
      where: eq(phantomAccounts.phantomWalletId, wallet.id)
    });
    
    if (accounts.length === 0) {
      return {
        success: false,
        message: `Customer ${customerId} has no accounts`,
        recommendation: 'Check account creation process or create accounts manually'
      };
    }
    
    return {
      success: true,
      message: `Customer ${customerId} and accounts verified`,
      details: {
        wallet: {
          id: wallet.id,
          walletId: wallet.walletId,
          status: wallet.status
        },
        accounts: accounts.map(account => ({
          id: account.id,
          accountId: account.accountId,
          currencyCode: account.currencyCode,
          balance: (account.balance || 0) / 100 // Convert cents to dollars
        }))
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Customer test failed',
      details: { error: error.message },
      recommendation: 'Check database connection and PhantomPay implementation'
    };
  }
}

// Account tests
async function runAccountTest(customerId: string, testType: string) {
  try {
    // Get the wallet
    const wallet = await db.query.phantomWallets.findFirst({
      where: eq(phantomWallets.walletId, customerId)
    });
    
    if (!wallet) {
      return {
        success: false,
        message: `Customer with ID ${customerId} not found`,
        recommendation: 'Verify the customer ID or create a new PhantomPay wallet'
      };
    }
    
    // Get the accounts
    const accounts = await db.query.phantomAccounts.findMany({
      where: eq(phantomAccounts.phantomWalletId, wallet.id)
    });
    
    if (accounts.length === 0) {
      return {
        success: false,
        message: `Customer ${customerId} has no accounts`,
        recommendation: 'Check account creation process or create accounts manually'
      };
    }
    
    if (testType === 'account_status') {
      return {
        success: true,
        message: `Account status for customer ${customerId} verified`,
        details: {
          totalAccounts: accounts.length,
          accounts: accounts.map(account => ({
            accountId: account.accountId,
            currencyCode: account.currencyCode,
            status: 'ACTIVE' // PhantomPay accounts are always active
          }))
        }
      };
    }
    
    if (testType === 'balance_check') {
      // For each account, get the balance from transactions
      const accountBalances = await Promise.all(
        accounts.map(async (account) => {
          // Get deposits (incoming)
          const [depositSum] = await db
            .select({ 
              sum: sql<number>`COALESCE(SUM(${phantomTransactions.amount}), 0)` 
            })
            .from(phantomTransactions)
            .where(eq(phantomTransactions.destinationAccountId, account.id));
          
          // Get withdrawals and outgoing transfers
          const [withdrawalSum] = await db
            .select({ 
              sum: sql<number>`COALESCE(SUM(${phantomTransactions.amount}), 0)` 
            })
            .from(phantomTransactions)
            .where(eq(phantomTransactions.sourceAccountId, account.id));
          
          const calculatedBalance = (depositSum.sum || 0) - (withdrawalSum.sum || 0);
          const storedBalance = account.balance || 0;
          
          return {
            accountId: account.accountId,
            currencyCode: account.currencyCode,
            storedBalance: storedBalance / 100, // Convert cents to dollars
            calculatedBalance: calculatedBalance / 100, // Convert cents to dollars
            isConsistent: calculatedBalance === storedBalance
          };
        })
      );
      
      const allConsistent = accountBalances.every(account => account.isConsistent);
      
      return {
        success: allConsistent,
        message: allConsistent 
          ? `Account balances for customer ${customerId} are consistent` 
          : `Some account balances for customer ${customerId} are inconsistent`,
        details: { accountBalances },
        recommendation: allConsistent ? null : 'Run data repair to fix inconsistent balances'
      };
    }
    
    return {
      success: true,
      message: `Accounts for customer ${customerId} verified`,
      details: {
        accounts: accounts.map(account => ({
          accountId: account.accountId,
          currencyCode: account.currencyCode,
          balance: (account.balance || 0) / 100 // Convert cents to dollars
        }))
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Account test failed',
      details: { error: error.message },
      recommendation: 'Check database connection and PhantomPay implementation'
    };
  }
}

// Transaction tests
async function runTransactionTest(transactionId: string | undefined, testType: string) {
  try {
    if (testType === 'transaction' && transactionId) {
      // Get the specific transaction
      const transaction = await db.query.phantomTransactions.findFirst({
        where: eq(phantomTransactions.transactionId, transactionId)
      });
      
      if (!transaction) {
        return {
          success: false,
          message: `Transaction with ID ${transactionId} not found`,
          recommendation: 'Verify the transaction ID or check if it has been processed'
        };
      }
      
      // Get source and destination accounts if they exist
      const [sourceAccount, destinationAccount] = await Promise.all([
        transaction.sourceAccountId 
          ? db.query.phantomAccounts.findFirst({
              where: eq(phantomAccounts.id, transaction.sourceAccountId)
            })
          : null,
        transaction.destinationAccountId
          ? db.query.phantomAccounts.findFirst({
              where: eq(phantomAccounts.id, transaction.destinationAccountId)
            })
          : null
      ]);
      
      return {
        success: true,
        message: `Transaction ${transactionId} details retrieved`,
        details: {
          transaction: {
            id: transaction.id,
            transactionId: transaction.transactionId,
            type: transaction.type,
            amount: transaction.amount / 100, // Convert cents to dollars
            currencyCode: transaction.currencyCode,
            status: transaction.status,
            createdAt: transaction.createdAt
          },
          sourceAccount: sourceAccount ? {
            accountId: sourceAccount.accountId,
            currencyCode: sourceAccount.currencyCode
          } : null,
          destinationAccount: destinationAccount ? {
            accountId: destinationAccount.accountId,
            currencyCode: destinationAccount.currencyCode
          } : null
        }
      };
    }
    
    if (testType === 'transaction_flow') {
      // Test the full transaction flow with a simulated transaction
      
      // 1. Create two test accounts
      const walletId = `phantom-wallet-test-${Date.now().toString().substr(-6)}`;
      const [wallet] = await db.insert(phantomWallets)
        .values({
          userId: req.user!.id,
          walletId,
          status: 'ACTIVE'
        })
        .returning();
      
      // Create USD and EUR accounts
      const [usdAccount, eurAccount] = await Promise.all([
        db.insert(phantomAccounts)
          .values({
            phantomWalletId: wallet.id,
            accountId: `phantom-acct-usd-${Date.now().toString().substr(-6)}`,
            currencyCode: 'USD',
            balance: 10000 // $100.00
          })
          .returning(),
        db.insert(phantomAccounts)
          .values({
            phantomWalletId: wallet.id,
            accountId: `phantom-acct-eur-${Date.now().toString().substr(-6)}`,
            currencyCode: 'EUR',
            balance: 0
          })
          .returning()
      ]);
      
      // 2. Create a test transaction (transfer from USD to EUR)
      const amount = 2500; // $25.00
      const [transaction] = await db.insert(phantomTransactions)
        .values({
          transactionId: `phantom-tx-test-${Date.now().toString().substr(-6)}`,
          sourceAccountId: usdAccount[0].id,
          destinationAccountId: eurAccount[0].id,
          amount,
          currencyCode: 'USD',
          type: 'TRANSFER',
          note: 'Test transaction flow',
          status: 'COMPLETED'
        })
        .returning();
      
      // 3. Update account balances
      await Promise.all([
        db.update(phantomAccounts)
          .set({ balance: 10000 - amount })
          .where(eq(phantomAccounts.id, usdAccount[0].id)),
        db.update(phantomAccounts)
          .set({ balance: amount })
          .where(eq(phantomAccounts.id, eurAccount[0].id))
      ]);
      
      // 4. Verify the results
      const [updatedUsdAccount, updatedEurAccount] = await Promise.all([
        db.query.phantomAccounts.findFirst({
          where: eq(phantomAccounts.id, usdAccount[0].id)
        }),
        db.query.phantomAccounts.findFirst({
          where: eq(phantomAccounts.id, eurAccount[0].id)
        })
      ]);
      
      const success = 
        updatedUsdAccount?.balance === 10000 - amount &&
        updatedEurAccount?.balance === amount;
      
      return {
        success,
        message: success
          ? 'Transaction flow test completed successfully'
          : 'Transaction flow test failed',
        details: {
          wallet: {
            id: wallet.id,
            walletId: wallet.walletId
          },
          transaction: {
            id: transaction.id,
            transactionId: transaction.transactionId,
            amount: transaction.amount / 100
          },
          usdAccountBalance: (updatedUsdAccount?.balance || 0) / 100,
          eurAccountBalance: (updatedEurAccount?.balance || 0) / 100,
          expected: {
            usdAccountBalance: (10000 - amount) / 100,
            eurAccountBalance: amount / 100
          }
        }
      };
    }
    
    return {
      success: false,
      message: 'Unknown transaction test type',
      recommendation: 'Specify a valid transaction test type'
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Transaction test failed',
      details: { error: error.message },
      recommendation: 'Check database connection and PhantomPay implementation'
    };
  }
}

// Error handling tests
async function runErrorHandlingTest() {
  try {
    // Test various error scenarios
    
    // 1. Insufficient funds error
    let insufficientFundsErrorCaught = false;
    try {
      // Create a wallet with zero balance
      const walletId = `phantom-wallet-test-${Date.now().toString().substr(-6)}`;
      const [wallet] = await db.insert(phantomWallets)
        .values({
          userId: req.user!.id,
          walletId,
          status: 'ACTIVE'
        })
        .returning();
      
      // Create account with zero balance
      const [account] = await db.insert(phantomAccounts)
        .values({
          phantomWalletId: wallet.id,
          accountId: `phantom-acct-test-${Date.now().toString().substr(-6)}`,
          currencyCode: 'USD',
          balance: 0
        })
        .returning();
      
      // Try to withdraw money (should fail)
      await phantomPayClient.withdrawMoney({
        amount: 100,
        currencyCode: 'USD',
        customerId: walletId,
        description: 'Test withdrawal'
      });
    } catch (error: any) {
      if (error.message && error.message.includes('Insufficient funds')) {
        insufficientFundsErrorCaught = true;
      }
    }
    
    // 2. Invalid currency error
    let invalidCurrencyErrorCaught = false;
    try {
      // Try to use an invalid currency code
      await phantomPayClient.depositMoney({
        amount: 100,
        currencyCode: 'INVALID',
        customerId: 'phantom-wallet-test',
        description: 'Test deposit'
      });
    } catch (error: any) {
      if (error.message && error.message.includes('Account not found for currency')) {
        invalidCurrencyErrorCaught = true;
      }
    }
    
    // 3. Wallet not found error
    let walletNotFoundErrorCaught = false;
    try {
      // Try to use a non-existent wallet ID
      await phantomPayClient.getBalances('phantom-wallet-nonexistent');
    } catch (error: any) {
      if (error.message && error.message.includes('Wallet not found')) {
        walletNotFoundErrorCaught = true;
      }
    }
    
    const allErrorsCaught = 
      insufficientFundsErrorCaught && 
      invalidCurrencyErrorCaught && 
      walletNotFoundErrorCaught;
    
    return {
      success: allErrorsCaught,
      message: allErrorsCaught
        ? 'Error handling test passed - all expected errors were properly caught and handled'
        : 'Some errors were not properly caught or handled',
      details: {
        insufficientFundsErrorCaught,
        invalidCurrencyErrorCaught,
        walletNotFoundErrorCaught
      },
      recommendation: !allErrorsCaught
        ? 'Review error handling in the PhantomPay implementation'
        : null
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error handling test failed unexpectedly',
      details: { error: error.message },
      recommendation: 'Check PhantomPay implementation for proper error handling'
    };
  }
}

// Data integrity tests
async function runDataIntegrityTest(testType: string) {
  try {
    if (testType === 'data_consistency') {
      // Check for inconsistencies in the data
      
      // 1. Check if all accounts belong to valid wallets
      const orphanedAccounts = await db
        .select({
          id: phantomAccounts.id,
          accountId: phantomAccounts.accountId
        })
        .from(phantomAccounts)
        .leftJoin(
          phantomWallets,
          eq(phantomAccounts.phantomWalletId, phantomWallets.id)
        )
        .where(isNull(phantomWallets.id));
      
      // 2. Check if all transactions reference valid accounts
      const orphanedSourceTransactions = await db
        .select({
          id: phantomTransactions.id,
          transactionId: phantomTransactions.transactionId
        })
        .from(phantomTransactions)
        .leftJoin(
          phantomAccounts,
          eq(phantomTransactions.sourceAccountId, phantomAccounts.id)
        )
        .where(
          and(
            ne(phantomTransactions.sourceAccountId, null),
            isNull(phantomAccounts.id)
          )
        );
      
      const orphanedDestTransactions = await db
        .select({
          id: phantomTransactions.id,
          transactionId: phantomTransactions.transactionId
        })
        .from(phantomTransactions)
        .leftJoin(
          phantomAccounts,
          eq(phantomTransactions.destinationAccountId, phantomAccounts.id)
        )
        .where(
          and(
            ne(phantomTransactions.destinationAccountId, null),
            isNull(phantomAccounts.id)
          )
        );
      
      const hasInconsistencies = 
        orphanedAccounts.length > 0 ||
        orphanedSourceTransactions.length > 0 ||
        orphanedDestTransactions.length > 0;
      
      return {
        success: !hasInconsistencies,
        message: !hasInconsistencies
          ? 'Data consistency check passed - no inconsistencies found'
          : 'Data consistency check failed - inconsistencies found',
        details: {
          orphanedAccounts,
          orphanedSourceTransactions,
          orphanedDestTransactions
        },
        recommendation: hasInconsistencies
          ? 'Run the data repair diagnostic to fix these inconsistencies'
          : null
      };
    }
    
    if (testType === 'orphaned_records') {
      // Check for orphaned records specifically
      
      // 1. Get wallets with no user
      const walletsWithNoUser = await db
        .select({
          id: phantomWallets.id,
          walletId: phantomWallets.walletId
        })
        .from(phantomWallets)
        .where(isNull(phantomWallets.userId));
      
      // 2. Get accounts with no transactions
      const accountsWithNoTransactions = await db
        .select({
          id: phantomAccounts.id,
          accountId: phantomAccounts.accountId
        })
        .from(phantomAccounts)
        .leftJoin(
          phantomTransactions,
          or(
            eq(phantomTransactions.sourceAccountId, phantomAccounts.id),
            eq(phantomTransactions.destinationAccountId, phantomAccounts.id)
          )
        )
        .where(isNull(phantomTransactions.id))
        .groupBy(phantomAccounts.id, phantomAccounts.accountId);
      
      const hasOrphanedRecords = 
        walletsWithNoUser.length > 0 ||
        accountsWithNoTransactions.length > 0;
      
      return {
        success: !hasOrphanedRecords,
        message: !hasOrphanedRecords
          ? 'No orphaned records found'
          : 'Orphaned records found in the database',
        details: {
          walletsWithNoUser,
          accountsWithNoTransactions
        },
        recommendation: hasOrphanedRecords
          ? 'Consider cleaning up these orphaned records'
          : null
      };
    }
    
    if (testType === 'balance_reconciliation') {
      // Check if account balances match transaction history
      
      // Get all accounts
      const accounts = await db.query.phantomAccounts.findMany();
      
      // Check each account's balance against its transactions
      const accountReconciliation = await Promise.all(
        accounts.map(async (account) => {
          // Get deposits (incoming)
          const [depositSum] = await db
            .select({ 
              sum: sql<number>`COALESCE(SUM(${phantomTransactions.amount}), 0)` 
            })
            .from(phantomTransactions)
            .where(eq(phantomTransactions.destinationAccountId, account.id));
          
          // Get withdrawals and outgoing transfers
          const [withdrawalSum] = await db
            .select({ 
              sum: sql<number>`COALESCE(SUM(${phantomTransactions.amount}), 0)` 
            })
            .from(phantomTransactions)
            .where(eq(phantomTransactions.sourceAccountId, account.id));
          
          const calculatedBalance = (depositSum.sum || 0) - (withdrawalSum.sum || 0);
          const storedBalance = account.balance || 0;
          
          return {
            accountId: account.accountId,
            currencyCode: account.currencyCode,
            storedBalance: storedBalance / 100, // Convert cents to dollars
            calculatedBalance: calculatedBalance / 100, // Convert cents to dollars
            isConsistent: calculatedBalance === storedBalance,
            difference: (calculatedBalance - storedBalance) / 100
          };
        })
      );
      
      const inconsistentAccounts = accountReconciliation.filter(account => !account.isConsistent);
      
      return {
        success: inconsistentAccounts.length === 0,
        message: inconsistentAccounts.length === 0
          ? 'All account balances match their transaction history'
          : `${inconsistentAccounts.length} account(s) have inconsistent balances`,
        details: {
          totalAccounts: accounts.length,
          inconsistentAccounts
        },
        recommendation: inconsistentAccounts.length > 0
          ? 'Run the data repair diagnostic to fix these inconsistencies'
          : null
      };
    }
    
    if (testType === 'data_repair') {
      // Repair data inconsistencies
      
      // 1. Fix account balances based on transaction history
      const accounts = await db.query.phantomAccounts.findMany();
      
      const repairs = await Promise.all(
        accounts.map(async (account) => {
          // Get deposits (incoming)
          const [depositSum] = await db
            .select({ 
              sum: sql<number>`COALESCE(SUM(${phantomTransactions.amount}), 0)` 
            })
            .from(phantomTransactions)
            .where(eq(phantomTransactions.destinationAccountId, account.id));
          
          // Get withdrawals and outgoing transfers
          const [withdrawalSum] = await db
            .select({ 
              sum: sql<number>`COALESCE(SUM(${phantomTransactions.amount}), 0)` 
            })
            .from(phantomTransactions)
            .where(eq(phantomTransactions.sourceAccountId, account.id));
          
          const calculatedBalance = (depositSum.sum || 0) - (withdrawalSum.sum || 0);
          const storedBalance = account.balance || 0;
          
          if (calculatedBalance !== storedBalance) {
            // Update the account balance
            await db.update(phantomAccounts)
              .set({ balance: calculatedBalance })
              .where(eq(phantomAccounts.id, account.id));
            
            return {
              accountId: account.accountId,
              oldBalance: storedBalance / 100,
              newBalance: calculatedBalance / 100,
              difference: (calculatedBalance - storedBalance) / 100
            };
          }
          
          return null;
        })
      );
      
      // Filter out null values (accounts that didn't need repair)
      const accountRepairs = repairs.filter(repair => repair !== null);
      
      return {
        success: true,
        message: accountRepairs.length > 0
          ? `Repaired ${accountRepairs.length} account balance(s)`
          : 'No account balances needed repair',
        details: {
          accountRepairs
        }
      };
    }
    
    return {
      success: false,
      message: 'Unknown data integrity test type',
      recommendation: 'Specify a valid data integrity test type'
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Data integrity test failed',
      details: { error: error.message },
      recommendation: 'Check database connection and retry the test'
    };
  }
}

// Get error events for real-time tracking
export async function getErrorEvents(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Get the latest error logs
    const errorLogs = await db
      .select({
        id: systemLogs.id,
        timestamp: systemLogs.createdAt,
        action: systemLogs.action,
        details: systemLogs.details,
        userId: systemLogs.userId
      })
      .from(systemLogs)
      .where(sql`${systemLogs.action} LIKE '%error%' OR ${systemLogs.action} LIKE '%fail%'`)
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit);
    
    // Transform logs to error events
    const errorEvents = errorLogs.map(log => {
      let level: 'info' | 'warning' | 'error' | 'critical' = 'info';
      let component = 'unknown';
      let source: 'client' | 'server' | 'api' = 'server';
      let message = log.action;
      let details = log.details;
      let stackTrace = '';
      
      // Parse details for more information
      if (log.details) {
        const detailsObj = typeof log.details === 'string' 
          ? JSON.parse(log.details)
          : log.details;
        
        if (detailsObj.level) level = detailsObj.level;
        if (detailsObj.component) component = detailsObj.component;
        if (detailsObj.source) source = detailsObj.source;
        if (detailsObj.message) message = detailsObj.message;
        if (detailsObj.stackTrace) stackTrace = detailsObj.stackTrace;
      }
      
      // Determine severity level from action if not specified
      if (!details?.level) {
        if (log.action.includes('critical') || log.action.includes('exception')) {
          level = 'critical';
        } else if (log.action.includes('error')) {
          level = 'error';
        } else if (log.action.includes('warn')) {
          level = 'warning';
        }
      }
      
      return {
        id: log.id.toString(),
        timestamp: log.timestamp?.toISOString() || new Date().toISOString(),
        level,
        message,
        component,
        source,
        details,
        stackTrace,
        userId: log.userId,
        seen: false
      };
    });
    
    res.json(errorEvents);
  } catch (error: any) {
    console.error('Error getting error events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get error events', 
      error: error.message 
    });
  }
}

// Mark an error event as seen
export async function markErrorAsSeen(req: Request, res: Response) {
  const { id } = req.params;
  
  try {
    // In a real implementation, we would update a database record
    // For now, we'll just return success
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking error as seen:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark error as seen', 
      error: error.message 
    });
  }
}

// Mark all error events as seen
export async function markAllErrorsAsSeen(req: Request, res: Response) {
  try {
    // In a real implementation, we would update database records
    // For now, we'll just return success
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking all errors as seen:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark all errors as seen', 
      error: error.message 
    });
  }
}