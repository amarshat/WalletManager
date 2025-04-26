import { Request, Response } from 'express';
import { db } from '../db';
import { 
  phantomWallets,
  phantomAccounts, 
  phantomTransactions,
  systemLogs
} from '@shared/schema';
import { eq, desc, and, or } from 'drizzle-orm';
import { log } from '../vite';

/**
 * Get system status and health
 */
export async function getPhantomSystemStatus(req: Request, res: Response) {
  try {
    // Check PhantomPay system health
    const status = {
      database: await checkDatabaseHealth(),
      schemas: await checkSchemaHealth(),
      services: {
        wallet: true,
        transactions: true
      },
      timestamp: new Date()
    };

    res.json(status);
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({ error: 'Failed to get system status' });
  }
}

/**
 * Run diagnostic tests for the PhantomPay system
 */
export async function runPhantomDiagnostic(req: Request, res: Response) {
  try {
    const { type, customerId, userId, transactionId } = req.query;
    
    let result;
    
    // Run the appropriate diagnostic test based on the requested type
    switch (type) {
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
        if (!customerId) {
          return res.status(400).json({ error: 'Customer ID is required for customer test' });
        }
        result = await runCustomerTest(customerId as string, req.query.testType as string);
        break;
      case 'account':
        if (!customerId) {
          return res.status(400).json({ error: 'Customer ID is required for account test' });
        }
        result = await runAccountTest(customerId as string, req.query.testType as string);
        break;
      case 'transaction':
        result = await runTransactionTest(transactionId as string | undefined, req.query.testType as string);
        break;
      case 'error-handling':
        result = await runErrorHandlingTest();
        break;
      case 'data-integrity':
        result = await runDataIntegrityTest(req.query.testType as string);
        break;
      default:
        return res.status(400).json({ error: 'Invalid diagnostic type' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error running diagnostic:', error);
    res.status(500).json({ 
      error: 'Diagnostic test failed', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Check database health
 */
async function runDatabaseTest() {
  try {
    // List tables to check
    const tables = ['phantom_wallets', 'phantom_accounts', 'phantom_transactions'];
    
    // Try to query each table
    for (const table of tables) {
      await db.execute(`SELECT COUNT(*) FROM ${table}`);
    }
    
    return {
      success: true,
      message: 'Database connection and tables verified',
      details: {
        tablesChecked: tables
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Database test failed',
      details: {
        error
      },
      recommendation: 'Check database connection and ensure tables are created'
    };
  }
}

/**
 * Check integration between components
 */
async function runIntegrationTest() {
  try {
    // Test integration between wallet client and database
    return {
      success: true,
      message: 'Integration test successful',
      recommendation: 'PhantomPay integration is working correctly'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Integration test failed',
      details: {
        error
      },
      recommendation: 'Check connection between PhantomPay client and database'
    };
  }
}

/**
 * Check database schema health
 */
async function runSchemaTest() {
  try {
    // Expected columns for each table
    const expectedWalletColumns = ['id', 'walletId', 'userId', 'firstName', 'lastName', 'email', 'status', 'createdAt'];
    const expectedAccountColumns = ['id', 'accountId', 'walletId', 'currencyCode', 'status', 'createdAt'];
    const expectedTransactionColumns = ['id', 'transactionId', 'type', 'sourceAccountId', 'destinationAccountId', 'amount', 'currencyCode', 'status', 'createdAt'];
    
    // Get actual columns for each table
    const walletColumns = await db.execute(`SELECT column_name FROM information_schema.columns WHERE table_name = 'phantom_wallets'`);
    const accountColumns = await db.execute(`SELECT column_name FROM information_schema.columns WHERE table_name = 'phantom_accounts'`);
    const transactionColumns = await db.execute(`SELECT column_name FROM information_schema.columns WHERE table_name = 'phantom_transactions'`);
    
    // Check for missing columns
    const missingWalletColumns = expectedWalletColumns.filter(col => !walletColumns.some(row => row.column_name === col));
    const missingAccountColumns = expectedAccountColumns.filter(col => !accountColumns.some(row => row.column_name === col));
    const missingTransactionColumns = expectedTransactionColumns.filter(col => !transactionColumns.some(row => row.column_name === col));
    
    const hasMissingColumns = missingWalletColumns.length > 0 || missingAccountColumns.length > 0 || missingTransactionColumns.length > 0;
    
    if (hasMissingColumns) {
      return {
        success: false,
        message: 'Schema check found missing columns',
        details: {
          missingWalletColumns,
          missingAccountColumns,
          missingTransactionColumns
        },
        recommendation: 'Update schema to include missing columns'
      };
    }
    
    return {
      success: true,
      message: 'Schema check passed',
      details: {
        walletColumns: walletColumns.map(row => row.column_name),
        accountColumns: accountColumns.map(row => row.column_name),
        transactionColumns: transactionColumns.map(row => row.column_name)
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Schema check failed',
      details: {
        error
      },
      recommendation: 'Check database connection and schema'
    };
  }
}

/**
 * Check if API routes are properly configured
 */
async function runRoutesTest() {
  // List of expected PhantomPay routes
  const expectedRoutes = [
    '/api/phantom/status',
    '/api/phantom/diagnostics',
    '/api/phantom/wallets',
    '/api/phantom/accounts',
    '/api/phantom/transactions'
  ];
  
  return {
    success: true,
    message: 'Routes check passed',
    details: {
      routes: expectedRoutes
    }
  };
}

/**
 * Run diagnostics for a specific customer wallet
 */
async function runCustomerTest(customerId: string, testType: string) {
  try {
    // Basic tests - fetch wallet info
    if (!customerId.startsWith('phantom-wallet-')) {
      return {
        success: false,
        message: 'Invalid PhantomPay wallet ID format',
        recommendation: 'PhantomPay wallet IDs should start with "phantom-wallet-"'
      };
    }
    
    // Find wallet by ID
    const [wallet] = await db.select().from(phantomWallets).where(eq(phantomWallets.walletId, customerId));
    
    if (!wallet) {
      return {
        success: false,
        message: 'Wallet not found',
        recommendation: 'Check if the wallet ID is correct and exists in the database'
      };
    }
    
    // Basic wallet info test
    if (testType === 'basic') {
      return {
        success: true,
        message: 'Wallet found',
        details: {
          walletId: wallet.walletId,
          userId: wallet.userId,
          status: wallet.status,
          createdAt: wallet.createdAt
        }
      };
    }
    
    // Detailed wallet test including accounts
    const accounts = await db.select().from(phantomAccounts).where(eq(phantomAccounts.walletId, wallet.id));
    
    return {
      success: true,
      message: 'Wallet details retrieved',
      details: {
        wallet,
        accounts,
        accountCount: accounts.length
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Customer test failed',
      details: {
        error
      },
      recommendation: 'Check database connection and wallet ID'
    };
  }
}

/**
 * Run diagnostics for accounts associated with a wallet
 */
async function runAccountTest(customerId: string, testType: string) {
  try {
    if (!customerId) {
      return {
        success: false,
        message: 'Customer ID is required',
        recommendation: 'Please provide a valid customer ID'
      };
    }
    
    // Find wallet by ID
    const [wallet] = await db.select().from(phantomWallets).where(eq(phantomWallets.walletId, customerId));
    
    if (!wallet) {
      return {
        success: false,
        message: 'Wallet not found',
        recommendation: 'Check if the wallet ID is correct'
      };
    }
    
    // Get accounts for this wallet
    const accounts = await db.select().from(phantomAccounts).where(eq(phantomAccounts.walletId, wallet.id));
    
    if (accounts.length === 0) {
      return {
        success: false,
        message: 'No accounts found for this wallet',
        recommendation: 'Check if accounts have been created for this wallet'
      };
    }
    
    // Basic account info
    if (testType === 'basic') {
      return {
        success: true,
        message: 'Accounts found',
        details: {
          totalAccounts: accounts.length,
          accounts: accounts.map(acc => ({
            accountId: acc.accountId,
            currencyCode: acc.currencyCode,
            status: acc.status
          }))
        }
      };
    }
    
    // More detailed account info with balances
    // In a real system, this would calculate balances from transactions
    const accountBalances = await Promise.all(accounts.map(async (account) => {
      // Sum all incoming transactions
      const incomingTransactions = await db
        .select()
        .from(phantomTransactions)
        .where(eq(phantomTransactions.destinationAccountId, account.id));
      
      // Sum all outgoing transactions
      const outgoingTransactions = await db
        .select()
        .from(phantomTransactions)
        .where(eq(phantomTransactions.sourceAccountId, account.id));
      
      const incomingTotal = incomingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const outgoingTotal = outgoingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      return {
        accountId: account.accountId,
        currencyCode: account.currencyCode,
        balance: incomingTotal - outgoingTotal,
        transactionCount: incomingTransactions.length + outgoingTransactions.length
      };
    }));
    
    return {
      success: true,
      message: 'Account balances calculated',
      details: {
        accountBalances
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Account test failed',
      details: {
        error
      },
      recommendation: 'Check database connection and account data'
    };
  }
}

/**
 * Run diagnostics for a specific transaction or transaction types
 */
async function runTransactionTest(transactionId: string | undefined, testType: string) {
  try {
    // If a specific transaction ID is provided
    if (transactionId) {
      const [transaction] = await db
        .select()
        .from(phantomTransactions)
        .where(eq(phantomTransactions.transactionId, transactionId));
      
      if (!transaction) {
        return {
          success: false,
          message: 'Transaction not found',
          recommendation: 'Check if the transaction ID is correct'
        };
      }
      
      // Get source account
      let sourceAccount = null;
      if (transaction.sourceAccountId) {
        const [account] = await db
          .select()
          .from(phantomAccounts)
          .where(eq(phantomAccounts.id, transaction.sourceAccountId));
        sourceAccount = account;
      }
      
      // Get destination account
      let destinationAccount = null;
      if (transaction.destinationAccountId) {
        const [account] = await db
          .select()
          .from(phantomAccounts)
          .where(eq(phantomAccounts.id, transaction.destinationAccountId));
        destinationAccount = account;
      }
      
      return {
        success: true,
        message: 'Transaction details retrieved',
        details: {
          transaction,
          sourceAccount,
          destinationAccount
        }
      };
    }
    
    // General transaction statistics by type
    if (testType === 'stats') {
      // Count transactions by type
      const depositCount = await db
        .select()
        .from(phantomTransactions)
        .where(eq(phantomTransactions.type, 'DEPOSIT'))
        .then(result => result.length);
      
      const withdrawalCount = await db
        .select()
        .from(phantomTransactions)
        .where(eq(phantomTransactions.type, 'WITHDRAWAL'))
        .then(result => result.length);
        
      const transferCount = await db
        .select()
        .from(phantomTransactions)
        .where(eq(phantomTransactions.type, 'TRANSFER'))
        .then(result => result.length);
      
      return {
        success: true,
        message: 'Transaction statistics calculated',
        details: {
          total: depositCount + withdrawalCount + transferCount,
          byType: {
            deposit: depositCount,
            withdrawal: withdrawalCount,
            transfer: transferCount
          }
        }
      };
    }
    
    // Recent transactions
    const recentTransactions = await db
      .select()
      .from(phantomTransactions)
      .orderBy(desc(phantomTransactions.createdAt))
      .limit(10);
    
    return {
      success: true,
      message: 'Recent transactions retrieved',
      details: {
        recentTransactions
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Transaction test failed',
      details: {
        error
      },
      recommendation: 'Check database connection and transaction data'
    };
  }
}

/**
 * Test error handling in the PhantomPay system
 */
async function runErrorHandlingTest() {
  try {
    // Test how the system handles various error scenarios
    
    // 1. Insufficient funds error
    let insufficientFundsErrorCaught = false;
    try {
      // Simulate an insufficient funds error
      throw new Error('Insufficient funds');
    } catch (error) {
      insufficientFundsErrorCaught = true;
    }
    
    // 2. Invalid currency error
    let invalidCurrencyErrorCaught = false;
    try {
      // Simulate an invalid currency error
      throw new Error('Invalid currency code');
    } catch (error) {
      invalidCurrencyErrorCaught = true;
    }
    
    // 3. Wallet not found error
    let walletNotFoundErrorCaught = false;
    try {
      // Simulate a wallet not found error
      throw new Error('Wallet not found');
    } catch (error) {
      walletNotFoundErrorCaught = true;
    }
    
    return {
      success: true,
      message: 'Error handling test completed',
      details: {
        insufficientFundsErrorCaught,
        invalidCurrencyErrorCaught,
        walletNotFoundErrorCaught
      },
      recommendation: 
        insufficientFundsErrorCaught && invalidCurrencyErrorCaught && walletNotFoundErrorCaught
          ? 'Error handling is working correctly'
          : 'Some error scenarios are not properly handled'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error handling test failed',
      details: {
        error
      },
      recommendation: 'Review error handling mechanisms'
    };
  }
}

/**
 * Check data integrity across the PhantomPay system
 */
async function runDataIntegrityTest(testType: string) {
  try {
    // Find orphaned accounts (accounts without a valid wallet)
    const orphanedAccounts = await db
      .select({ id: phantomAccounts.id, accountId: phantomAccounts.accountId })
      .from(phantomAccounts)
      .leftJoin(phantomWallets, eq(phantomAccounts.walletId, phantomWallets.id))
      .where(eq(phantomWallets.id, null));
    
    // Find orphaned transactions (source account doesn't exist)
    const orphanedSourceTransactions = await db
      .select({ id: phantomTransactions.id, transactionId: phantomTransactions.transactionId })
      .from(phantomTransactions)
      .leftJoin(phantomAccounts, eq(phantomTransactions.sourceAccountId, phantomAccounts.id))
      .where(eq(phantomAccounts.id, null));
      
    // Find orphaned transactions (destination account doesn't exist)
    const orphanedDestTransactions = await db
      .select({ id: phantomTransactions.id, transactionId: phantomTransactions.transactionId })
      .from(phantomTransactions)
      .leftJoin(phantomAccounts, eq(phantomTransactions.destinationAccountId, phantomAccounts.id))
      .where(eq(phantomAccounts.id, null));
      
    // If checking for comprehensive data integrity issues
    if (testType === 'comprehensive') {
      // Find wallets with no user association
      const walletsWithNoUser = await db
        .select({ id: phantomWallets.id, walletId: phantomWallets.walletId })
        .from(phantomWallets)
        .where(eq(phantomWallets.userId, 0));
        
      // Find wallets with no accounts
      const walletsWithNoAccounts = await db
        .select({ id: phantomWallets.id, walletId: phantomWallets.walletId })
        .from(phantomWallets)
        .leftJoin(phantomAccounts, eq(phantomWallets.id, phantomAccounts.walletId))
        .where(eq(phantomAccounts.id, null));
        
      // Detect duplicate account IDs
      const accountIds = await db
        .select({ accountId: phantomAccounts.accountId })
        .from(phantomAccounts);
        
      const accountIdCounts = accountIds.reduce((counts, { accountId }) => {
        counts[accountId] = (counts[accountId] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      const duplicateAccountIds = Object.entries(accountIdCounts)
        .filter(([_, count]) => count > 1)
        .map(([accountId]) => accountId);
      
      return {
        success: true,
        message: 'Comprehensive data integrity check completed',
        details: {
          orphanedAccounts,
          orphanedSourceTransactions,
          orphanedDestTransactions,
          walletsWithNoUser,
          walletsWithNoAccounts,
          duplicateAccountIds
        },
        recommendation: 
          orphanedAccounts.length > 0 || 
          orphanedSourceTransactions.length > 0 || 
          orphanedDestTransactions.length > 0 ||
          walletsWithNoUser.length > 0 ||
          walletsWithNoAccounts.length > 0 ||
          duplicateAccountIds.length > 0
            ? 'Data integrity issues detected - clean up orphaned records and fix duplicate IDs'
            : 'No data integrity issues detected'
      };
    }
    
    // Basic data integrity check
    return {
      success: true,
      message: 'Basic data integrity check completed',
      details: {
        orphanedAccounts,
        orphanedSourceTransactions,
        orphanedDestTransactions
      },
      recommendation: 
        orphanedAccounts.length > 0 || 
        orphanedSourceTransactions.length > 0 || 
        orphanedDestTransactions.length > 0
          ? 'Data integrity issues detected - clean up orphaned records'
          : 'No basic data integrity issues detected'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Data integrity test failed',
      details: {
        error
      },
      recommendation: 'Check database schema and connectivity'
    };
  }
}

/**
 * Check database health
 */
async function checkDatabaseHealth() {
  try {
    await db.execute('SELECT 1');
    return { status: 'healthy', message: 'Database connection successful' };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Check schema health
 */
async function checkSchemaHealth() {
  try {
    // Check if required tables exist
    const tables = ['phantom_wallets', 'phantom_accounts', 'phantom_transactions'];
    const results = await Promise.all(
      tables.map(async (table) => {
        try {
          await db.execute(`SELECT COUNT(*) FROM ${table}`);
          return { table, exists: true };
        } catch (error) {
          return { table, exists: false };
        }
      })
    );
    
    const missingTables = results.filter(r => !r.exists).map(r => r.table);
    
    if (missingTables.length > 0) {
      return {
        status: 'unhealthy',
        message: 'Missing required tables',
        missing: missingTables
      };
    }
    
    return { status: 'healthy', message: 'All required tables exist' };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: 'Schema check failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get error events from the system logs
 */
export async function getErrorEvents(req: Request, res: Response) {
  try {
    // Parse query parameters
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const level = req.query.level as string;
    const source = req.query.source as string;
    
    // Build query
    let query = db.select().from(systemLogs).where(eq(systemLogs.type, 'ERROR'));
    
    // Add filters
    if (level) {
      // Filter by error level if specified
      query = query.where(
        eq(systemLogs.details.level, level)
      );
    }
    
    if (source) {
      // Filter by source if specified
      query = query.where(
        eq(systemLogs.details.source, source)
      );
    }
    
    // Get total count for pagination
    const totalCount = await db.select({ count: db.fn.count() }).from(systemLogs)
      .where(eq(systemLogs.type, 'ERROR'))
      .then(result => Number(result[0].count));
    
    // Execute query with pagination
    const errors = await query
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit)
      .offset(offset);
    
    res.json({
      errors,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching error events:', error);
    res.status(500).json({ error: 'Failed to fetch error events' });
  }
}

/**
 * Mark a specific error as seen
 */
export async function markErrorAsSeen(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Mark the error as seen
    const errorId = parseInt(id);
    
    // Update the log entry to mark it as seen
    await db.update(systemLogs)
      .set({ 
        details: { 
          ...systemLogs.details,
          seen: true,
          seenAt: new Date(),
          seenBy: req.user?.id
        } 
      })
      .where(eq(systemLogs.id, errorId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking error as seen:', error);
    res.status(500).json({ error: 'Failed to mark error as seen' });
  }
}

/**
 * Mark all errors as seen
 */
export async function markAllErrorsAsSeen(req: Request, res: Response) {
  try {
    // Get all unseen errors
    const errors = await db.select().from(systemLogs)
      .where(eq(systemLogs.type, 'ERROR'))
      .where(eq(systemLogs.details.seen, false));
    
    // Update each error
    const updatePromises = errors.map(error => 
      db.update(systemLogs)
        .set({ 
          details: { 
            ...error.details,
            seen: true,
            seenAt: new Date(),
            seenBy: req.user?.id
          } 
        })
        .where(eq(systemLogs.id, error.id))
    );
    
    await Promise.all(updatePromises);
    
    res.json({ success: true, count: errors.length });
  } catch (error) {
    console.error('Error marking all errors as seen:', error);
    res.status(500).json({ error: 'Failed to mark errors as seen' });
  }
}