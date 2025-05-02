import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertBrandSettingsSchema, insertCardSchema, insertPrepaidCardSchema,
  insertCarbonImpactSchema, insertCarbonOffsetSchema, insertCarbonPreferenceSchema
} from "@shared/schema";
import { walletClient } from "./wallet-client";
import { errorHandler } from "./diagnostics/error-tracking";
import path from "path";
import fs from "fs";

// Middleware to ensure user is authenticated
const ensureAuth = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};

// Middleware to ensure user is an admin
const ensureAdmin = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ error: "Forbidden: Admin access required" });
};

// Helper to log API calls
const logApiCall = async (req: Request, action: string, statusCode: number, responseData: any = null) => {
  if (!req.user) return;
  
  try {
    // Only include properties defined in the schema, omit component for now
    await storage.addSystemLog({
      userId: req.user.id,
      action,
      statusCode,
      requestData: req.body,
      responseData,
      source: 'api',
      level: statusCode >= 400 ? 'error' : 'info'
    });
  } catch (error) {
    console.error("Failed to log API call:", error);
  }
};

// Import the test routes
import { 
  healthAuthTest, 
  createWalletTest, 
  depositTest, 
  withdrawalTest 
} from './admin/test-routes';

import { 
  getPhantomSystemStatus, 
  runPhantomDiagnostic, 
  getErrorEvents,
  markErrorAsSeen, 
  markAllErrorsAsSeen 
} from './diagnostics/diagnostics-routes';
import { logClientError } from './diagnostics/error-tracking';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Setup error handler middleware
  app.use('/api/client-error', logClientError);
  
  // Register troubleshooting and diagnostic routes
  app.get('/api/admin/phantom-system-status', ensureAdmin, getPhantomSystemStatus);
  app.post('/api/admin/phantom-diagnostics', ensureAdmin, runPhantomDiagnostic);
  app.get('/api/admin/error-events', ensureAdmin, getErrorEvents);
  app.post('/api/admin/error-events/:id/seen', ensureAdmin, markErrorAsSeen);
  app.post('/api/admin/error-events/mark-all-seen', ensureAdmin, markAllErrorsAsSeen);
  
  // Error log endpoints
  app.get('/api/logs', ensureAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const logs = await storage.getSystemLogs(limit);
      res.json({ errors: logs });
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });
  
  app.post('/api/logs/mark-all-seen', ensureAdmin, async (req, res) => {
    try {
      // This is a simplified version - in a real app we would update the 'seen' flag in the database
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking logs as seen:', error);
      res.status(500).json({ error: 'Failed to mark logs as seen' });
    }
  });

  // Brand Settings Routes
  app.get("/api/brand", async (req, res) => {
    try {
      const settings = await storage.getBrandSettings();
      res.json(settings || { name: "PaySage", tagline: "Your Digital Wallet Solution" });
    } catch (error) {
      console.error("Error fetching brand settings:", error);
      res.status(500).json({ error: "Failed to fetch brand settings" });
    }
  });
  
  app.put("/api/brand", ensureAdmin, async (req, res) => {
    try {
      const validatedData = insertBrandSettingsSchema.parse(req.body);
      const updated = await storage.updateBrandSettings(validatedData);
      
      await logApiCall(req, "Update brand settings", 200, updated);
      res.json(updated);
    } catch (error) {
      console.error("Error updating brand settings:", error);
      res.status(400).json({ error: "Invalid brand settings data" });
    }
  });
  
  // Update specific brand settings fields (patch)
  app.patch("/api/brand", ensureAdmin, async (req, res) => {
    try {
      // Get current settings
      const currentSettings = await storage.getBrandSettings();
      if (!currentSettings) {
        return res.status(404).json({ error: "Brand settings not found" });
      }
      
      // Validate wallet config if provided
      if (req.body.walletConfig) {
        // Merge with existing wallet config if it exists
        const updatedSettings = {
          ...currentSettings,
          walletConfig: {
            ...(currentSettings.walletConfig || {}),
            ...req.body.walletConfig
          }
        };
        
        const updated = await storage.updateBrandSettings(updatedSettings);
        await logApiCall(req, "Update wallet configuration", 200, updated);
        return res.json(updated);
      }
      
      // Handle other partial updates
      const partialUpdate = {
        ...currentSettings,
        ...req.body
      };
      
      const updated = await storage.updateBrandSettings(partialUpdate);
      await logApiCall(req, "Partial update brand settings", 200, updated);
      res.json(updated);
    } catch (error) {
      console.error("Error updating brand settings:", error);
      res.status(400).json({ error: "Invalid brand settings data" });
    }
  });
  
  // User Management Routes (Admin only)
  app.get("/api/users", ensureAdmin, async (req, res) => {
    try {
      const users = await storage.listUsers(false); // Get non-admin users
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // Admin endpoint to get all users with their wallet details
  app.get("/api/admin/users-with-wallets", ensureAdmin, async (req, res) => {
    try {
      // Get all non-admin users
      const users = await storage.listUsers(false);
      
      // Enhance each user with wallet info
      const enhancedUsers = await Promise.all(users.map(async (user) => {
        // Get the user's wallet
        const wallet = await storage.getWalletByUserId(user.id);
        
        // Default response with no wallet
        const userWithWallet = {
          ...user,
          hasWallet: false,
          wallet: null,
          balances: null
        };
        
        // If wallet exists, get balances
        if (wallet) {
          userWithWallet.hasWallet = true;
          userWithWallet.wallet = wallet;
          
          try {
            const balances = await walletClient.getBalances(wallet.customerId);
            userWithWallet.balances = balances;
          } catch (error) {
            console.error(`Failed to get balances for user ${user.id}:`, error);
            userWithWallet.balances = { error: "Failed to fetch balances" };
          }
        }
        
        return userWithWallet;
      }));
      
      res.json(enhancedUsers);
    } catch (error) {
      console.error("Error getting users with wallets:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get users with wallets" 
      });
    }
  });
  
  // Admin bulk transfer endpoint
  app.post("/api/admin/bulk-transfer", ensureAdmin, async (req, res) => {
    try {
      const { sourceUserName, currencyCode, transfers } = req.body;
      
      if (!sourceUserName || !currencyCode || !transfers || !Array.isArray(transfers)) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      
      // Get source user
      const sourceUser = await storage.getUserByUsername(sourceUserName);
      if (!sourceUser) {
        return res.status(404).json({ error: "Source user not found" });
      }
      
      // Get source wallet
      const sourceWallet = await storage.getWalletByUserId(sourceUser.id);
      if (!sourceWallet) {
        return res.status(404).json({ error: "Source wallet not found" });
      }
      
      // Check source user balances and validate total amount
      const sourceBalances = await walletClient.getBalances(sourceWallet.customerId);
      const sourceAccount = sourceBalances.accounts.find((acc: any) => acc.currencyCode === currencyCode);
      
      if (!sourceAccount) {
        return res.status(400).json({ error: `Source user doesn't have an account with currency ${currencyCode}` });
      }
      
      const availableBalance = parseFloat(sourceAccount.balance);
      let totalTransferAmount = 0;
      
      // Validate transfers
      const validatedTransfers = [];
      const errors = [];
      
      for (const transfer of transfers) {
        const { destinationUserName, amount } = transfer;
        
        // Validate destination user
        const destinationUser = await storage.getUserByUsername(destinationUserName);
        if (!destinationUser) {
          errors.push({ destinationUserName, error: "Destination user not found" });
          continue;
        }
        
        // Validate amount
        let validAmount = 0;
        try {
          if (typeof amount === 'number') {
            validAmount = amount;
          } else if (typeof amount === 'string') {
            validAmount = parseFloat(amount);
          }
          
          if (isNaN(validAmount) || validAmount <= 0) {
            errors.push({ destinationUserName, error: "Amount must be a positive number" });
            continue;
          }
          
          // Round to 2 decimal places
          validAmount = parseFloat(validAmount.toFixed(2));
        } catch (error) {
          errors.push({ destinationUserName, error: "Invalid amount format" });
          continue;
        }
        
        // Check if destination user has a wallet
        const destinationWallet = await storage.getWalletByUserId(destinationUser.id);
        if (!destinationWallet) {
          errors.push({ destinationUserName, error: "Destination user doesn't have a wallet" });
          continue;
        }
        
        // Add to valid transfers
        validatedTransfers.push({
          destinationUserName,
          destinationUser,
          destinationWallet,
          amount: validAmount
        });
        
        totalTransferAmount += validAmount;
      }
      
      // Check if total amount exceeds available balance
      if (totalTransferAmount > availableBalance) {
        return res.status(400).json({ 
          error: `Insufficient funds. Available balance: ${availableBalance} ${currencyCode}, total transfer amount: ${totalTransferAmount} ${currencyCode}`,
          availableBalance,
          totalTransferAmount
        });
      }
      
      // Process transfers
      const results = [];
      
      for (const transfer of validatedTransfers) {
        try {
          const transferResponse = await walletClient.transferMoney({
            amount: transfer.amount,
            currencyCode,
            sourceCustomerId: sourceWallet.customerId,
            destinationCustomerId: transfer.destinationWallet.customerId,
            note: `Admin transfer to ${transfer.destinationUser.fullName}`
          });
          
          results.push({
            destinationUserName: transfer.destinationUserName,
            amount: transfer.amount,
            status: "success",
            transaction: transferResponse
          });
        } catch (error) {
          console.error(`Error in bulk transfer to ${transfer.destinationUserName}:`, error);
          results.push({
            destinationUserName: transfer.destinationUserName,
            amount: transfer.amount,
            status: "failed",
            error: error instanceof Error ? error.message : "Transfer failed"
          });
        }
      }
      
      await logApiCall(req, "Admin bulk transfer", 200, {
        sourceUserName,
        currencyCode,
        totalTransferAmount,
        results
      });
      
      res.json({
        success: true,
        sourceUserName,
        currencyCode,
        totalTransferAmount,
        results,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error("Error in admin bulk transfer:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process bulk transfer" 
      });
    }
  });
  
  // Admin endpoint to get transactions for a specific user
  app.get("/api/admin/user/:userId/transactions", ensureAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get wallet
      const wallet = await storage.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(404).json({ error: "User doesn't have a wallet" });
      }
      
      // Get transactions
      const transactions = await walletClient.getTransactions(wallet.customerId);
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName
        },
        wallet: {
          id: wallet.id,
          customerId: wallet.customerId,
          status: wallet.status
        },
        transactions
      });
    } catch (error) {
      console.error(`Error getting transactions for user:`, error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get user transactions" 
      });
    }
  });
  
  app.post("/api/users", ensureAdmin, async (req, res) => {
    try {
      // Create user
      let userData: {
        username: string;
        password: string;
        fullName: string;
        email?: string;
        country?: string;
        defaultCurrency: string;
        isAdmin: boolean;
        isPhantomUser?: boolean;
      } = {
        username: req.body.username,
        password: req.body.password, // Will be hashed in auth.ts createUser
        fullName: req.body.fullName,
        email: req.body.email,
        country: req.body.country,
        defaultCurrency: req.body.defaultCurrency || "USD",
        isAdmin: false
      };
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Check if phantom pay is requested
      const isPhantom = !!req.body.usePhantomPay;
      
      // Update user data with phantom flag if needed
      if (isPhantom) {
        userData = {
          ...userData,
          isPhantomUser: true
        };
      }
      
      // Create user in our system
      const user = await storage.createUser(userData);
      
      // Now create wallet
      const walletResponse = await walletClient.createWallet(user.id, {
        accounts: [{
          currencyCode: userData.defaultCurrency,
          externalId: userData.username
        }],
        profile: {
          firstName: userData.fullName.split(' ')[0],
          lastName: userData.fullName.split(' ').slice(1).join(' ') || '',
          email: userData.email,
          dateOfBirth: null,
          gender: null,
          nationality: userData.country,
          cell: null
        }
      });
      
      let wallet = null;
      
      // If wallet creation was successful, save the wallet info
      if (walletResponse && walletResponse.accounts?.[0]?.customerId) {
        try {
          // Create wallet record
          wallet = await storage.createWallet({
            userId: user.id,
            customerId: walletResponse.accounts[0].customerId,
            externalReference: user.username
          });
          
          // Create wallet account record
          await storage.addWalletAccount({
            walletId: wallet.id,
            accountId: walletResponse.accounts[0].id,
            currencyCode: walletResponse.accounts[0].currencyCode,
            externalId: walletResponse.accounts[0].externalId,
            hasVirtualInstrument: !!walletResponse.accounts[0].virtualInstrument
          });
        } catch (walletError) {
          console.error("Error saving wallet info:", walletError);
          // We'll continue even if saving wallet info fails
        }
      }
      
      await logApiCall(req, "Create user with wallet", 201, { user, wallet });
      
      // Always return success with activation info, even if wallet had issues
      res.status(201).json({ 
        user,
        wallet,
        message: "User created successfully. The user will need to activate their wallet on first login." 
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  
  app.put("/api/users/:id", ensureAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      await logApiCall(req, `Update user ${userId}`, 200, updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  app.delete("/api/users/:id", ensureAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      
      await logApiCall(req, `Delete user ${userId}`, 200, { success });
      res.json({ success });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  
  // Wallet Routes
  app.get("/api/wallet", ensureAuth, async (req, res) => {
    try {
      // Get wallet
      const wallet = await storage.getWalletByUserId(req.user!.id);
      
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      // Get wallet accounts
      const accounts = await storage.getWalletAccounts(wallet.id);
      
      // Get balances using wallet client
      const balances = await walletClient.getBalances(wallet.customerId);
      
      await logApiCall(req, "Get wallet balances", 200, balances);
      res.json({ wallet, accounts, balances });
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });
  
  // Transaction Routes
  app.post("/api/transactions/deposit", ensureAuth, async (req, res) => {
    try {
      // Get the raw values
      const rawAmount = req.body.amount;
      const currencyCode = req.body.currencyCode;
      const description = req.body.description;
      
      if (!rawAmount || !currencyCode) {
        return res.status(400).json({ error: "Amount and currency are required" });
      }
      
      // Ensure amount is a number with multiple layers of validation
      let amount: number;
      
      try {
        // First convert to a number
        if (typeof rawAmount === 'number') {
          amount = rawAmount;
        } else if (typeof rawAmount === 'string') {
          // Remove any non-numeric characters except decimal point
          const cleanedAmount = rawAmount.replace(/[^0-9.]/g, '');
          amount = Number(cleanedAmount);
        } else {
          throw new Error('Invalid amount format');
        }
        
        // Validate the number
        if (isNaN(amount) || !isFinite(amount)) {
          throw new Error('Amount is not a valid number');
        }
        
        if (amount <= 0) {
          throw new Error('Amount must be greater than zero');
        }
        
        // Keep decimal precision by using parseFloat and toFixed(2)
        amount = parseFloat(amount.toFixed(2));
        
      } catch (error) {
        console.error("Amount validation failed:", error);
        return res.status(400).json({ error: "Amount must be a valid positive number" });
      }
      
      const wallet = await storage.getWalletByUserId(req.user!.id);
      
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      console.log('Deposit amount after processing:', { 
        rawAmount, 
        processedAmount: amount, 
        type: typeof amount,
        valueAsJson: JSON.stringify(amount)
      });
      
      const depositResponse = await walletClient.depositMoney({
        amount,
        currencyCode,
        customerId: wallet.customerId,
        description: description || "Deposit"
      });
      
      await logApiCall(req, "Deposit money", 200, depositResponse);
      res.json(depositResponse);
    } catch (error) {
      console.error("Error depositing money:", error);
      res.status(500).json({ error: "Failed to deposit money" });
    }
  });
  
  app.post("/api/transactions/transfer", ensureAuth, async (req, res) => {
    try {
      // Get the raw values
      const rawAmount = req.body.amount;
      const currencyCode = req.body.currencyCode;
      const recipientUsername = req.body.recipientUsername;
      const note = req.body.note;
      
      if (!rawAmount || !currencyCode || !recipientUsername) {
        return res.status(400).json({ error: "Amount, currency, and recipient are required" });
      }
      
      // Ensure amount is a number with multiple layers of validation
      let amount: number;
      
      try {
        // First convert to a number
        if (typeof rawAmount === 'number') {
          amount = rawAmount;
        } else if (typeof rawAmount === 'string') {
          // Remove any non-numeric characters except decimal point
          const cleanedAmount = rawAmount.replace(/[^0-9.]/g, '');
          amount = Number(cleanedAmount);
        } else {
          throw new Error('Invalid amount format');
        }
        
        // Validate the number
        if (isNaN(amount) || !isFinite(amount)) {
          throw new Error('Amount is not a valid number');
        }
        
        if (amount <= 0) {
          throw new Error('Amount must be greater than zero');
        }
        
        // Round to integer for storage
        amount = parseFloat(amount.toFixed(2));
        
      } catch (error) {
        console.error("Amount validation failed:", error);
        return res.status(400).json({ error: "Amount must be a valid positive number" });
      }
      
      // Get sender wallet
      const senderWallet = await storage.getWalletByUserId(req.user!.id);
      
      if (!senderWallet) {
        return res.status(404).json({ error: "Sender wallet not found" });
      }
      
      // Get recipient user
      const recipientUser = await storage.getUserByUsername(recipientUsername);
      
      if (!recipientUser) {
        return res.status(404).json({ error: "Recipient not found" });
      }
      
      // Check that user is not transferring to themselves
      if (recipientUser.id === req.user!.id) {
        return res.status(400).json({ error: "Cannot transfer to yourself" });
      }
      
      // Get recipient wallet
      const recipientWallet = await storage.getWalletByUserId(recipientUser.id);
      
      if (!recipientWallet) {
        return res.status(404).json({ error: "Recipient wallet not found" });
      }
      
      // Check if sender has enough balance
      try {
        const balances = await walletClient.getBalances(senderWallet.customerId);
        const accountWithCurrency = balances.accounts.find((acc: any) => acc.currencyCode === currencyCode);
        
        if (!accountWithCurrency) {
          return res.status(400).json({ error: `You don't have an account with currency ${currencyCode}` });
        }
        
        const availableBalance = parseFloat(accountWithCurrency.balance);
        if (availableBalance < amount) {
          return res.status(400).json({ 
            error: `Insufficient funds. Available balance: ${availableBalance} ${currencyCode}`,
            availableBalance
          });
        }
        
        console.log(`Balance check passed: ${availableBalance} >= ${amount}`);
      } catch (error) {
        console.error("Error checking balance:", error);
        return res.status(500).json({ error: "Failed to check balance" });
      }
      
      console.log('Transfer amount after processing:', { 
        rawAmount, 
        processedAmount: amount, 
        type: typeof amount,
        valueAsJson: JSON.stringify(amount)
      });
      
      // Include recipient's name in the note if not provided
      const transferNote = note || `Transfer to ${recipientUser.fullName}`;
      
      const transferResponse = await walletClient.transferMoney({
        amount,
        currencyCode,
        sourceCustomerId: senderWallet.customerId,
        destinationCustomerId: recipientWallet.customerId,
        note: transferNote
      });
      
      await logApiCall(req, "Transfer money", 200, transferResponse);
      
      // Include recipient info in the response for better UI display
      res.json({
        ...transferResponse,
        recipient: {
          username: recipientUser.username,
          fullName: recipientUser.fullName,
        }
      });
    } catch (error) {
      console.error("Error transferring money:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to transfer money" 
      });
    }
  });
  
  app.post("/api/transactions/withdraw", ensureAuth, async (req, res) => {
    try {
      // Get the raw values
      const rawAmount = req.body.amount;
      const currencyCode = req.body.currencyCode;
      const description = req.body.description;
      
      if (!rawAmount || !currencyCode) {
        return res.status(400).json({ error: "Amount and currency are required" });
      }
      
      // Ensure amount is a number with multiple layers of validation
      let amount: number;
      
      try {
        // First convert to a number
        if (typeof rawAmount === 'number') {
          amount = rawAmount;
        } else if (typeof rawAmount === 'string') {
          // Remove any non-numeric characters except decimal point
          const cleanedAmount = rawAmount.replace(/[^0-9.]/g, '');
          amount = Number(cleanedAmount);
        } else {
          throw new Error('Invalid amount format');
        }
        
        // Validate the number
        if (isNaN(amount) || !isFinite(amount)) {
          throw new Error('Amount is not a valid number');
        }
        
        if (amount <= 0) {
          throw new Error('Amount must be greater than zero');
        }
        
        // Round to integer for storage
        amount = parseFloat(amount.toFixed(2));
        
      } catch (error) {
        console.error("Amount validation failed:", error);
        return res.status(400).json({ error: "Amount must be a valid positive number" });
      }
      
      const wallet = await storage.getWalletByUserId(req.user!.id);
      
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      // Check if user has enough balance for withdrawal
      try {
        const balances = await walletClient.getBalances(wallet.customerId);
        const accountWithCurrency = balances.accounts.find((acc: any) => acc.currencyCode === currencyCode);
        
        if (!accountWithCurrency) {
          return res.status(400).json({ error: `You don't have an account with currency ${currencyCode}` });
        }
        
        const availableBalance = parseFloat(accountWithCurrency.balance);
        if (availableBalance < amount) {
          return res.status(400).json({ 
            error: `Insufficient funds. Available balance: ${availableBalance} ${currencyCode}`,
            availableBalance
          });
        }
        
        console.log(`Balance check passed for withdrawal: ${availableBalance} >= ${amount}`);
      } catch (error) {
        console.error("Error checking balance for withdrawal:", error);
        return res.status(500).json({ error: "Failed to check balance" });
      }
      
      console.log('Withdrawal amount after processing:', { 
        rawAmount, 
        processedAmount: amount, 
        type: typeof amount,
        valueAsJson: JSON.stringify(amount)
      });
      
      const withdrawResponse = await walletClient.withdrawMoney({
        amount,
        currencyCode,
        customerId: wallet.customerId,
        description: description || "Withdrawal"
      });
      
      await logApiCall(req, "Withdraw money", 200, withdrawResponse);
      res.json(withdrawResponse);
    } catch (error) {
      console.error("Error withdrawing money:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to withdraw money" 
      });
    }
  });
  
  app.get("/api/transactions", ensureAuth, async (req, res) => {
    try {
      const wallet = await storage.getWalletByUserId(req.user!.id);
      
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      const transactions = await walletClient.getTransactions(wallet.customerId);
      
      await logApiCall(req, "Get transactions", 200, transactions);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });
  
  // Card Management Routes
  app.get("/api/cards", ensureAuth, async (req, res) => {
    try {
      const cards = await storage.getCardsByUserId(req.user!.id);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ error: "Failed to fetch cards" });
    }
  });
  
  app.post("/api/cards", ensureAuth, async (req, res) => {
    try {
      const cardData = insertCardSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // If this is the default card, unset other default cards
      if (cardData.isDefault) {
        const userCards = await storage.getCardsByUserId(req.user!.id);
        for (const card of userCards) {
          if (card.isDefault) {
            await storage.updateCard(card.id, { isDefault: false });
          }
        }
      }
      
      const card = await storage.addCard(cardData);
      
      await logApiCall(req, "Add card", 201, card);
      res.status(201).json(card);
    } catch (error) {
      console.error("Error adding card:", error);
      res.status(400).json({ error: "Invalid card data" });
    }
  });
  
  app.delete("/api/cards/:id", ensureAuth, async (req, res) => {
    try {
      const cardId = parseInt(req.params.id);
      const success = await storage.deleteCard(cardId);
      
      if (!success) {
        return res.status(404).json({ error: "Card not found" });
      }
      
      await logApiCall(req, `Delete card ${cardId}`, 200, { success });
      res.json({ success });
    } catch (error) {
      console.error("Error deleting card:", error);
      res.status(500).json({ error: "Failed to delete card" });
    }
  });
  
  // Prepaid Card Management Routes
  app.get("/api/prepaid-cards", ensureAuth, async (req, res) => {
    try {
      const cards = await storage.getPrepaidCardsByUserId(req.user!.id);
      
      // Get brand settings to validate against limit
      const settings = await storage.getBrandSettings();
      const maxPrepaidCards = settings?.walletConfig?.maxPrepaidCards || 3;
      
      res.json({
        cards,
        limit: maxPrepaidCards,
        canAddMore: cards.length < maxPrepaidCards
      });
    } catch (error) {
      console.error("Error fetching prepaid cards:", error);
      res.status(500).json({ error: "Failed to fetch prepaid cards" });
    }
  });
  
  app.get("/api/prepaid-cards/:id", ensureAuth, async (req, res) => {
    try {
      const cardId = parseInt(req.params.id);
      const card = await storage.getPrepaidCardById(cardId);
      
      if (!card) {
        return res.status(404).json({ error: "Prepaid card not found" });
      }
      
      // Make sure card belongs to user
      if (card.userId !== req.user!.id) {
        return res.status(403).json({ error: "You do not have permission to view this card" });
      }
      
      res.json(card);
    } catch (error) {
      console.error("Error fetching prepaid card:", error);
      res.status(500).json({ error: "Failed to fetch prepaid card" });
    }
  });
  
  app.post("/api/prepaid-cards", ensureAuth, async (req, res) => {
    try {
      // Get user's existing prepaid cards
      const existingCards = await storage.getPrepaidCardsByUserId(req.user!.id);
      
      // Get brand settings to validate against limit
      const settings = await storage.getBrandSettings();
      const maxPrepaidCards = settings?.walletConfig?.maxPrepaidCards || 3;
      
      // Check if limit has been reached
      if (existingCards.length >= maxPrepaidCards) {
        return res.status(400).json({ 
          error: `You have reached the maximum limit of ${maxPrepaidCards} prepaid cards`
        });
      }
      
      // Validate and create card data
      const cardData = insertPrepaidCardSchema.parse({
        ...req.body,
        userId: req.user!.id,
        cardType: "MASTERCARD", // Default to Mastercard as per requirements
        balance: req.body.balance || 0,
        currencyCode: req.body.currencyCode || "USD"
      });
      
      // If this is the default card, unset other default cards
      if (cardData.isDefault) {
        for (const card of existingCards) {
          if (card.isDefault) {
            await storage.updatePrepaidCard(card.id, { isDefault: false });
          }
        }
      }
      
      const card = await storage.addPrepaidCard(cardData);
      
      await logApiCall(req, "Add prepaid card", 201, card);
      res.status(201).json(card);
    } catch (error) {
      console.error("Error creating prepaid card:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid prepaid card data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create prepaid card" });
      }
    }
  });
  
  app.put("/api/prepaid-cards/:id", ensureAuth, async (req, res) => {
    try {
      const cardId = parseInt(req.params.id);
      
      // Check if card exists and belongs to user
      const card = await storage.getPrepaidCardById(cardId);
      if (!card) {
        return res.status(404).json({ error: "Prepaid card not found" });
      }
      
      if (card.userId !== req.user!.id) {
        return res.status(403).json({ error: "You do not have permission to update this card" });
      }
      
      // Remove userId from update data to prevent ownership changes
      const { userId, ...updateData } = req.body;
      
      const updatedCard = await storage.updatePrepaidCard(cardId, updateData);
      
      await logApiCall(req, "Update prepaid card", 200, updatedCard);
      res.json(updatedCard);
    } catch (error) {
      console.error("Error updating prepaid card:", error);
      res.status(500).json({ error: "Failed to update prepaid card" });
    }
  });
  
  app.delete("/api/prepaid-cards/:id", ensureAuth, async (req, res) => {
    try {
      const cardId = parseInt(req.params.id);
      
      // Check if card belongs to user
      const card = await storage.getPrepaidCardById(cardId);
      
      if (!card) {
        return res.status(404).json({ error: "Prepaid card not found" });
      }
      
      if (card.userId !== req.user!.id) {
        return res.status(403).json({ error: "You do not have permission to delete this card" });
      }
      
      const success = await storage.deletePrepaidCard(cardId);
      
      await logApiCall(req, "Delete prepaid card", success ? 200 : 404, { success });
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Prepaid card not found" });
      }
    } catch (error) {
      console.error("Error deleting prepaid card:", error);
      res.status(500).json({ error: "Failed to delete prepaid card" });
    }
  });
  
  // API Testing Routes (Admin only)
  app.get("/api/admin/test/auth", ensureAdmin, healthAuthTest);
  app.post("/api/admin/test/wallet", ensureAdmin, createWalletTest);
  app.post("/api/admin/test/deposit", ensureAdmin, depositTest);
  app.post("/api/admin/test/withdrawal", ensureAdmin, withdrawalTest);
  
  // System Logs Routes (Admin only)
  app.get("/api/logs", ensureAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const logs = await storage.getSystemLogs(limit, offset);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });
  
  // Bulk transfer
  app.post("/api/transactions/bulk", ensureAuth, async (req, res) => {
    try {
      const { transfers } = req.body;
      
      if (!Array.isArray(transfers) || transfers.length === 0) {
        return res.status(400).json({ error: "Invalid transfers data" });
      }
      
      const wallet = await storage.getWalletByUserId(req.user!.id);
      
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      // Get current balances for all currencies to validate transfers
      const balancesResponse = await walletClient.getBalances(wallet.customerId);
      // Create a map of currency -> balance for quick lookup
      const balancesByCurrency = new Map<string, number>();
      for (const account of balancesResponse.accounts) {
        balancesByCurrency.set(account.currencyCode, parseFloat(account.balance));
      }
      
      // Organize transfers by currency to track running balances
      const transfersByCurrency = new Map<string, number>();
      
      const results = [];
      const errors = [];
      
      // First validate all transfers without executing them
      for (const transfer of transfers) {
        try {
          const recipientUsername = transfer.recipientUsername;
          const currencyCode = transfer.currencyCode;
          const note = transfer.note;
          const rawAmount = transfer.amount;
          
          // Ensure amount is a number with multiple layers of validation
          let amount: number;
          
          try {
            // First convert to a number
            if (typeof rawAmount === 'number') {
              amount = rawAmount;
            } else if (typeof rawAmount === 'string') {
              // Remove any non-numeric characters except decimal point
              const cleanedAmount = rawAmount.replace(/[^0-9.]/g, '');
              amount = Number(cleanedAmount);
            } else {
              throw new Error('Invalid amount format');
            }
            
            // Validate the number
            if (isNaN(amount) || !isFinite(amount)) {
              throw new Error('Amount is not a valid number');
            }
            
            if (amount <= 0) {
              throw new Error('Amount must be greater than zero');
            }
            
            // Round to integer for storage
            amount = parseFloat(amount.toFixed(2));
            
          } catch (error) {
            console.error("Amount validation failed in bulk transfer:", error);
            errors.push({ transfer, error: "Amount must be a valid positive number" });
            continue;
          }
          
          // Check if user has the currency account
          if (!balancesByCurrency.has(currencyCode)) {
            errors.push({ transfer, error: `You don't have an account with currency ${currencyCode}` });
            continue;
          }
          
          // Get recipient user
          const recipientUser = await storage.getUserByUsername(recipientUsername);
          
          if (!recipientUser) {
            errors.push({ transfer, error: "Recipient not found" });
            continue;
          }
          
          // Check that user is not transferring to themselves
          if (recipientUser.id === req.user!.id) {
            errors.push({ transfer, error: "Cannot transfer to yourself" });
            continue;
          }
          
          // Get recipient wallet
          const recipientWallet = await storage.getWalletByUserId(recipientUser.id);
          
          if (!recipientWallet) {
            errors.push({ transfer, error: "Recipient wallet not found" });
            continue;
          }
          
          // Track running total for this currency
          const currentTotal = transfersByCurrency.get(currencyCode) || 0;
          transfersByCurrency.set(currencyCode, currentTotal + amount);
          
          // Check if running total exceeds available balance
          const runningTotal = transfersByCurrency.get(currencyCode) || 0;
          const availableBalance = balancesByCurrency.get(currencyCode) || 0;
          
          if (runningTotal > availableBalance) {
            errors.push({ 
              transfer, 
              error: `Insufficient funds. Available balance: ${availableBalance} ${currencyCode}, total transfers so far: ${runningTotal} ${currencyCode}`
            });
            // Revert the running total so further transfers can still be validated
            transfersByCurrency.set(currencyCode, currentTotal);
            continue;
          }
          
          // If we got here, the transfer is valid
          transfer.amount = amount; // Normalize the amount for the actual transfer
          transfer.recipientUser = recipientUser; // Store user for the actual transfer
          transfer.recipientWallet = recipientWallet; // Store wallet for the actual transfer
        } catch (error) {
          errors.push({ transfer, error: error instanceof Error ? error.message : "Transfer validation failed" });
        }
      }
      
      // If there were any errors in validation, return them without performing any transfers
      if (errors.length > 0) {
        return res.status(400).json({ 
          errors,
          message: "Validation failed. No transfers were processed." 
        });
      }
      
      // Perform all the validated transfers
      for (const transfer of transfers) {
        try {
          const amount = transfer.amount;
          const currencyCode = transfer.currencyCode;
          const recipientUser = transfer.recipientUser;
          const recipientWallet = transfer.recipientWallet;
          const note = transfer.note || `Bulk transfer to ${recipientUser.fullName}`;
          
          console.log('Processing bulk transfer:', { 
            amount, 
            currencyCode, 
            recipient: recipientUser.username
          });
          
          const transferResponse = await walletClient.transferMoney({
            amount,
            currencyCode,
            sourceCustomerId: wallet.customerId,
            destinationCustomerId: recipientWallet.customerId,
            note
          });
          
          results.push({ 
            transfer: {
              amount,
              currencyCode,
              recipientUsername: recipientUser.username
            }, 
            result: {
              ...transferResponse,
              recipient: {
                username: recipientUser.username,
                fullName: recipientUser.fullName,
              }
            }
          });
        } catch (error) {
          errors.push({ 
            transfer: {
              amount: transfer.amount,
              currencyCode: transfer.currencyCode,
              recipientUsername: transfer.recipientUser.username
            }, 
            error: error instanceof Error ? error.message : "Transfer failed" 
          });
        }
      }
      
      await logApiCall(req, "Bulk transfer", 200, { results, errors });
      res.json({ results, errors });
    } catch (error) {
      console.error("Error processing bulk transfer:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process bulk transfer" 
      });
    }
  });
  
  // User search for transfers
  app.get("/api/users/search", ensureAuth, async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.json([]);
      }
      
      const allUsers = await storage.listUsers(false);
      const filteredUsers = allUsers.filter(user => 
        user.id !== req.user!.id && // Don't include current user
        (user.username.toLowerCase().includes(query.toLowerCase()) || 
         user.fullName.toLowerCase().includes(query.toLowerCase()))
      );
      
      // Only return necessary information
      const results = filteredUsers.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName
      }));
      
      res.json(results);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ error: "Failed to search users" });
    }
  });

  // Create a route to initialize/repair wallet for the current user
  app.post("/api/wallet/initialize", ensureAuth, async (req, res) => {
    try {
      // Check if user already has a wallet
      let wallet = await storage.getWalletByUserId(req.user!.id);
      
      if (wallet) {
        // If wallet exists but status is not ACTIVE, update it to ACTIVE
        if (wallet.status !== 'ACTIVE') {
          wallet = await storage.updateWallet(wallet.id, { status: 'ACTIVE' });
          await logApiCall(req, "Activate existing wallet", 200, wallet);
          
          return res.json({ 
            message: "Wallet activated successfully", 
            wallet 
          });
        }
        
        // Wallet already exists and is active
        return res.json({ 
          message: "Wallet already exists and is active", 
          wallet 
        });
      }
      
      // User doesn't have a wallet, create one
      const walletResponse = await walletClient.createWallet(req.user!.id, {
        customer: {
          firstName: req.user!.fullName.split(' ')[0],
          lastName: req.user!.fullName.split(' ').slice(1).join(' ') || req.user!.fullName.split(' ')[0],
          email: req.user!.email || `${req.user!.username}@example.com`,
          id: req.user!.id.toString()
        }
      });
      
      // Create a local wallet record
      if (walletResponse.id) {
        wallet = await storage.createWallet({
          userId: req.user!.id,
          customerId: walletResponse.id,
          externalReference: walletResponse.externalReference || null,
          status: 'ACTIVE' // Always set status to ACTIVE when creating via KYC flow
        });
        
        // Create accounts for the wallet
        // If the wallet doesn't have accounts from the API response, create a default USD account
        if (walletResponse.accounts && Array.isArray(walletResponse.accounts) && walletResponse.accounts.length > 0) {
          for (const account of walletResponse.accounts) {
            await storage.addWalletAccount({
              walletId: wallet.id,
              accountId: account.id,
              currencyCode: account.currencyCode,
              externalId: account.externalId || null,
              hasVirtualInstrument: account.hasVirtualInstrument || false
            });
          }
        } else {
          // Create default USD account if none exists
          const defaultAccount = {
            id: `account-${Date.now()}`,
            currencyCode: req.user!.defaultCurrency || 'USD',
            externalId: req.user!.username,
            hasVirtualInstrument: false
          };
          
          await storage.addWalletAccount({
            walletId: wallet.id,
            accountId: defaultAccount.id,
            currencyCode: defaultAccount.currencyCode,
            externalId: defaultAccount.externalId,
            hasVirtualInstrument: defaultAccount.hasVirtualInstrument
          });
        }
        
        await logApiCall(req, "Initialize wallet", 201, wallet);
        return res.status(201).json({
          message: "Wallet created and activated successfully",
          wallet
        });
      } else {
        return res.status(500).json({ error: "Failed to create wallet" });
      }
    } catch (error) {
      console.error("Error initializing wallet:", error);
      res.status(500).json({ error: "Failed to initialize wallet" });
    }
  });

  // Budget functionality
  app.get('/api/budget/categories', ensureAuth, async (req, res) => {
    try {
      const categories = await storage.getBudgetCategories(req.user!.id);
      res.json(categories);
    } catch (error) {
      await logApiCall(req, 'Get Budget Categories', 500, { error: error.message });
      res.status(500).json({ error: 'Failed to retrieve budget categories' });
    }
  });

  app.post('/api/budget/categories', ensureAuth, async (req, res) => {
    try {
      const category = await storage.createBudgetCategory({
        ...req.body,
        userId: req.user!.id,
        isSystem: false
      });
      await logApiCall(req, 'Create Budget Category', 201, category);
      res.status(201).json(category);
    } catch (error) {
      await logApiCall(req, 'Create Budget Category', 500, { error: error.message });
      res.status(500).json({ error: 'Failed to create budget category' });
    }
  });

  app.get('/api/budget/plans', ensureAuth, async (req, res) => {
    try {
      const plans = await storage.getBudgetPlans(req.user!.id);
      res.json(plans);
    } catch (error) {
      await logApiCall(req, 'Get Budget Plans', 500, { error: error.message });
      res.status(500).json({ error: 'Failed to retrieve budget plans' });
    }
  });

  app.get('/api/budget/plans/active', ensureAuth, async (req, res) => {
    try {
      const plan = await storage.getActiveBudgetPlan(req.user!.id);
      if (!plan) {
        return res.status(404).json({ error: 'No active budget plan found' });
      }
      res.json(plan);
    } catch (error) {
      await logApiCall(req, 'Get Active Budget Plan', 500, { error: error.message });
      res.status(500).json({ error: 'Failed to retrieve active budget plan' });
    }
  });

  app.post('/api/budget/plans', ensureAuth, async (req, res) => {
    try {
      const plan = await storage.createBudgetPlan({
        ...req.body,
        userId: req.user!.id
      });
      
      // If allocations were included in the request, create them
      if (req.body.allocations && Array.isArray(req.body.allocations)) {
        for (const allocation of req.body.allocations) {
          await storage.createBudgetAllocation({
            ...allocation,
            budgetPlanId: plan.id,
            spentAmount: "0"
          });
        }
      }
      
      await logApiCall(req, 'Create Budget Plan', 201, plan);
      res.status(201).json(plan);
    } catch (error) {
      await logApiCall(req, 'Create Budget Plan', 500, { error: error.message });
      res.status(500).json({ error: 'Failed to create budget plan' });
    }
  });

  app.get('/api/budget/plans/:id/allocations', ensureAuth, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getBudgetPlan(planId);
      
      // Make sure the plan belongs to the authenticated user
      if (!plan || plan.userId !== req.user!.id) {
        return res.status(404).json({ error: 'Budget plan not found' });
      }
      
      const allocations = await storage.getBudgetAllocations(planId);
      res.json(allocations);
    } catch (error) {
      await logApiCall(req, 'Get Budget Allocations', 500, { error: error.message });
      res.status(500).json({ error: 'Failed to retrieve budget allocations' });
    }
  });

  app.post('/api/budget/allocations', ensureAuth, async (req, res) => {
    try {
      // Verify the budget plan belongs to the user
      const plan = await storage.getBudgetPlan(req.body.budgetPlanId);
      if (!plan || plan.userId !== req.user!.id) {
        return res.status(404).json({ error: 'Budget plan not found' });
      }
      
      const allocation = await storage.createBudgetAllocation({
        ...req.body,
        spentAmount: req.body.spentAmount || "0"
      });
      
      await logApiCall(req, 'Create Budget Allocation', 201, allocation);
      res.status(201).json(allocation);
    } catch (error) {
      await logApiCall(req, 'Create Budget Allocation', 500, { error: error.message });
      res.status(500).json({ error: 'Failed to create budget allocation' });
    }
  });

  app.post('/api/budget/transactions', ensureAuth, async (req, res) => {
    try {
      const transaction = await storage.createBudgetTransaction({
        ...req.body,
        userId: req.user!.id,
        transactionDate: req.body.transactionDate || new Date()
      });
      
      await logApiCall(req, 'Create Budget Transaction', 201, transaction);
      res.status(201).json(transaction);
    } catch (error) {
      await logApiCall(req, 'Create Budget Transaction', 500, { error: error.message });
      res.status(500).json({ error: 'Failed to create budget transaction' });
    }
  });

  app.get('/api/budget/transactions', ensureAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const transactions = await storage.getBudgetTransactions(req.user!.id, limit);
      res.json(transactions);
    } catch (error) {
      await logApiCall(req, 'Get Budget Transactions', 500, { error: error.message });
      res.status(500).json({ error: 'Failed to retrieve budget transactions' });
    }
  });
  
  // Carbon Impact API endpoints
  
  // Get all carbon categories
  app.get('/api/carbon/categories', async (req, res) => {
    try {
      const categories = await storage.getCarbonCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching carbon categories:', error);
      res.status(500).json({ error: 'Failed to retrieve carbon categories' });
    }
  });
  
  // Get user carbon preferences
  app.get('/api/carbon/preferences', ensureAuth, async (req, res) => {
    try {
      const preferences = await storage.getUserCarbonPreference(req.user!.id);
      res.json(preferences || { trackingEnabled: false, offsetEnabled: false });
    } catch (error) {
      console.error('Error fetching carbon preferences:', error);
      res.status(500).json({ error: 'Failed to retrieve carbon preferences' });
    }
  });
  
  // Create or update user carbon preferences
  app.post('/api/carbon/preferences', ensureAuth, async (req, res) => {
    try {
      const preferences = await storage.createOrUpdateCarbonPreference(req.user!.id, req.body);
      await logApiCall(req, 'Update Carbon Preferences', 200, preferences);
      res.json(preferences);
    } catch (error) {
      console.error('Error updating carbon preferences:', error);
      await logApiCall(req, 'Update Carbon Preferences', 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(400).json({ error: 'Failed to update carbon preferences' });
    }
  });
  
  // Record a carbon impact
  app.post('/api/carbon/impact', ensureAuth, async (req, res) => {
    try {
      const validatedData = insertCarbonImpactSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const impact = await storage.recordCarbonImpact(validatedData);
      await logApiCall(req, 'Record Carbon Impact', 201, impact);
      res.status(201).json(impact);
    } catch (error) {
      console.error('Error recording carbon impact:', error);
      await logApiCall(req, 'Record Carbon Impact', 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(400).json({ error: 'Failed to record carbon impact' });
    }
  });
  
  // Get user's carbon impacts
  app.get('/api/carbon/impacts', ensureAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const impacts = await storage.getUserCarbonImpacts(req.user!.id, limit);
      res.json(impacts);
    } catch (error) {
      console.error('Error fetching carbon impacts:', error);
      res.status(500).json({ error: 'Failed to retrieve carbon impacts' });
    }
  });
  
  // Record a carbon offset
  app.post('/api/carbon/offset', ensureAuth, async (req, res) => {
    try {
      const validatedData = insertCarbonOffsetSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const offset = await storage.recordCarbonOffset(validatedData);
      await logApiCall(req, 'Record Carbon Offset', 201, offset);
      res.status(201).json(offset);
    } catch (error) {
      console.error('Error recording carbon offset:', error);
      await logApiCall(req, 'Record Carbon Offset', 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(400).json({ error: 'Failed to record carbon offset' });
    }
  });
  
  // Get user's carbon offsets
  app.get('/api/carbon/offsets', ensureAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offsets = await storage.getUserCarbonOffsets(req.user!.id, limit);
      res.json(offsets);
    } catch (error) {
      console.error('Error fetching carbon offsets:', error);
      res.status(500).json({ error: 'Failed to retrieve carbon offsets' });
    }
  });
  
  // Get user's carbon summary
  app.get('/api/carbon/summary', ensureAuth, async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const summary = await storage.getUserCarbonSummary(req.user!.id, days);
      res.json(summary);
    } catch (error) {
      console.error('Error fetching carbon summary:', error);
      res.status(500).json({ error: 'Failed to retrieve carbon summary' });
    }
  });

  // Widget system
  // Serve the widget.js file with appropriate headers for cross-origin use
  app.get('/widget.js', (req, res) => {
    const widgetPath = path.resolve(import.meta.dirname, '..', 'client', 'public', 'widget.js');
    
    // Set CORS headers specifically for the widget
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Check if the file exists
    if (fs.existsSync(widgetPath)) {
      // Send the widget.js file
      res.sendFile(widgetPath);
    } else {
      console.error(`Widget file not found at ${widgetPath}`);
      res.status(404).send('Widget not found');
    }
  });

  // Widget demo pages for testing
  app.get('/demo/gaming', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PixelRacer - Gaming with PaySage Integration</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #0f0f1a;
      color: #fff;
    }
    header {
      background: linear-gradient(135deg, #1e1e3a, #2b2b4c);
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(90deg, #fc6767, #ec008c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    nav ul {
      display: flex;
      list-style: none;
    }
    nav ul li {
      margin-left: 20px;
    }
    nav ul li a {
      color: #fff;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    nav ul li a:hover {
      color: #fc6767;
    }
    main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .hero {
      background: url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80') center/cover;
      height: 400px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 40px;
      margin-bottom: 30px;
      position: relative;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%);
      border-radius: 15px;
    }
    .hero-content {
      position: relative;
      width: 50%;
    }
    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
    }
    .hero p {
      font-size: 1.1rem;
      margin-bottom: 30px;
    }
    .btn {
      background: linear-gradient(90deg, #fc6767, #ec008c);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.3s ease;
      display: inline-block;
      text-decoration: none;
    }
    .btn:hover {
      transform: translateY(-3px);
    }
    .games-section {
      margin-top: 60px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .section-header h2 {
      font-size: 1.8rem;
      background: linear-gradient(90deg, #fff, #a5a5a5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .game-card {
      background: linear-gradient(135deg, #2a2a3d, #1e1e2e);
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .game-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
    }
    .game-card img {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }
    .game-info {
      padding: 15px;
    }
    .game-info h3 {
      margin-top: 0;
    }
    .game-info p {
      color: #ccc;
      font-size: 0.9rem;
    }
    .price {
      font-weight: bold;
      color: #fc6767;
    }
    .widgets-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 40px;
      margin-bottom: 40px;
    }
    footer {
      background: #1a1a2e;
      padding: 30px;
      text-align: center;
      margin-top: 60px;
    }
    .wallet-section {
      background: linear-gradient(135deg, #282842, #1e1e2e);
      border-radius: 15px;
      padding: 30px;
      margin: 40px 0;
    }
    .wallet-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .wallet-header h2 {
      font-size: 1.8rem;
      margin-bottom: 10px;
    }
    .wallet-header p {
      color: #ccc;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">PixelRacer</div>
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">Games</a></li>
        <li><a href="#">Tournament</a></li>
        <li><a href="#">Leaderboard</a></li>
        <li><a href="#">Support</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div class="hero-content">
        <h1>Race to Victory with PixelRacer</h1>
        <p>Experience adrenaline-pumping racing games. Compete, win, and earn rewards!</p>
        <a href="#" class="btn">Play Now</a>
      </div>
    </section>

    <section class="wallet-section">
      <div class="wallet-header">
        <h2>Your Gaming Wallet</h2>
        <p>Powered by PaySage - Play, pay, and earn rewards seamlessly</p>
      </div>
      
      <div class="widgets-container">
        <!-- Balance Widget -->
        <script src="/widget.js" data-widget="balance" data-theme="dark" data-title="Your Gaming Balance"></script>
        
        <!-- Quick Actions Widget -->
        <script src="/widget.js" data-widget="quick-actions" data-theme="dark" data-title="Quick Actions"></script>
      </div>
    </section>

    <section class="games-section">
      <div class="section-header">
        <h2>Featured Racing Games</h2>
        <a href="#" class="btn">View All</a>
      </div>
      
      <div class="games-grid">
        <div class="game-card">
          <img src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=800&q=80" alt="Night Speedway">
          <div class="game-info">
            <h3>Night Speedway</h3>
            <p>Race through neon-lit tracks in this futuristic racing game.</p>
            <p class="price">$19.99</p>
          </div>
        </div>
        
        <div class="game-card">
          <img src="https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80" alt="Rally Masters">
          <div class="game-info">
            <h3>Rally Masters</h3>
            <p>Take on rough terrains and unpredictable weather in this rally simulation.</p>
            <p class="price">$24.99</p>
          </div>
        </div>
        
        <div class="game-card">
          <img src="https://images.unsplash.com/photo-1511994714008-b6d68a8b32a2?auto=format&fit=crop&w=800&q=80" alt="Formula Legend">
          <div class="game-info">
            <h3>Formula Legend</h3>
            <p>Experience the thrill of formula racing with realistic physics.</p>
            <p class="price">$29.99</p>
          </div>
        </div>
        
        <div class="game-card">
          <img src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80" alt="Drift King">
          <div class="game-info">
            <h3>Drift King</h3>
            <p>Master the art of drifting in this challenging street racing game.</p>
            <p class="price">$17.99</p>
          </div>
        </div>
      </div>
    </section>

    <section class="wallet-section">
      <div class="wallet-header">
        <h2>Recent Transactions</h2>
        <p>Track your gaming purchases and earnings</p>
      </div>
      
      <!-- Transactions Widget -->
      <script src="/widget.js" data-widget="transactions" data-theme="dark" data-title="Recent Gaming Transactions"></script>
    </section>
  </main>

  <footer>
    <p>&copy; 2025 PixelRacer. All rights reserved.</p>
    <p>Integrated with PaySage Wallet for secure gaming transactions</p>
  </footer>
</body>
</html>`);
  });

  app.get('/demo/parking', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EZ Park - Parking made simple</title>
  <style>
    body {
      font-family: 'Segoe UI', 'Roboto', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
      color: #333;
    }
    header {
      background: #fff;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo {
      font-size: 22px;
      font-weight: bold;
      color: #2c3e50;
    }
    .logo span {
      color: #3498db;
    }
    nav ul {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    nav ul li {
      margin-left: 20px;
    }
    nav ul li a {
      color: #2c3e50;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;
    }
    nav ul li a:hover {
      color: #3498db;
    }
    main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .hero {
      background: linear-gradient(rgba(44, 62, 80, 0.8), rgba(44, 62, 80, 0.8)), url('https://images.unsplash.com/photo-1526626607369-4f1c8fa2adea?auto=format&fit=crop&w=1200&q=80') center/cover;
      padding: 80px 40px;
      text-align: center;
      color: white;
      border-radius: 10px;
      margin-bottom: 40px;
    }
    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
    }
    .hero p {
      font-size: 1.2rem;
      margin-bottom: 30px;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }
    .btn {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 30px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
      text-decoration: none;
      display: inline-block;
    }
    .btn:hover {
      background-color: #2980b9;
    }
    .btn-secondary {
      background-color: transparent;
      border: 2px solid white;
      margin-left: 15px;
    }
    .btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .parking-finder {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      margin-bottom: 40px;
    }
    .finder-title {
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: #2c3e50;
    }
    .search-form {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr auto;
      gap: 15px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    .form-group label {
      margin-bottom: 8px;
      font-weight: 500;
      color: #596275;
    }
    .form-group input, .form-group select {
      padding: 12px 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
    }
    .search-btn {
      align-self: flex-end;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
      margin-bottom: 50px;
    }
    .feature-card {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      text-align: center;
      transition: transform 0.3s;
    }
    .feature-card:hover {
      transform: translateY(-5px);
    }
    .feature-icon {
      font-size: 2.5rem;
      color: #3498db;
      margin-bottom: 15px;
    }
    .feature-card h3 {
      font-size: 1.3rem;
      margin-bottom: 12px;
      color: #2c3e50;
    }
    .feature-card p {
      color: #596275;
      line-height: 1.6;
    }
    .account-section {
      background: linear-gradient(135deg, #f5f7fa, #e4e8f0);
      border-radius: 10px;
      padding: 30px;
      margin: 40px 0;
    }
    .account-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .account-header h2 {
      font-size: 1.8rem;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .account-header p {
      color: #596275;
    }
    .widgets-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .parking-list {
      background: white;
      border-radius: 10px;
      padding: 25px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      margin-top: 40px;
    }
    .parking-list h2 {
      color: #2c3e50;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .parking-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #eee;
    }
    .parking-details h3 {
      margin: 0 0 5px 0;
      color: #2c3e50;
    }
    .parking-details p {
      margin: 0;
      color: #596275;
    }
    .parking-price {
      font-weight: bold;
      color: #3498db;
      font-size: 1.2rem;
    }
    .reserve-btn {
      padding: 8px 16px;
      font-size: 0.9rem;
    }
    footer {
      background: #2c3e50;
      color: white;
      padding: 30px;
      text-align: center;
      margin-top: 60px;
    }
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
    }
    .footer-links {
      display: flex;
      justify-content: center;
      list-style: none;
      padding: 0;
      margin: 20px 0;
    }
    .footer-links li {
      margin: 0 15px;
    }
    .footer-links a {
      color: #ecf0f1;
      text-decoration: none;
      transition: color 0.3s;
    }
    .footer-links a:hover {
      color: #3498db;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">EZ<span>Park</span></div>
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">Find Parking</a></li>
        <li><a href="#">How It Works</a></li>
        <li><a href="#">Pricing</a></li>
        <li><a href="#">Support</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section class="hero">
      <h1>Parking Made Simple</h1>
      <p>Find and reserve parking spots in real-time. No more circling the block looking for parking!</p>
      <div class="hero-buttons">
        <a href="#" class="btn">Find Parking Now</a>
        <a href="#" class="btn btn-secondary">Learn More</a>
      </div>
    </section>

    <section class="parking-finder">
      <h2 class="finder-title">Find Available Parking Spots</h2>
      <form class="search-form">
        <div class="form-group">
          <label for="location">Location</label>
          <input type="text" id="location" placeholder="Enter address or landmark">
        </div>
        <div class="form-group">
          <label for="arrival">Arrival Time</label>
          <input type="datetime-local" id="arrival">
        </div>
        <div class="form-group">
          <label for="duration">Duration</label>
          <select id="duration">
            <option value="1">1 hour</option>
            <option value="2">2 hours</option>
            <option value="3">3 hours</option>
            <option value="4">4 hours</option>
            <option value="day">Full day</option>
          </select>
        </div>
        <button type="submit" class="btn search-btn">Search</button>
      </form>
    </section>

    <section class="account-section">
      <div class="account-header">
        <h2>Your Parking Account</h2>
        <p>Manage your payments and parking history with PaySage</p>
      </div>
      
      <div class="widgets-container">
        <!-- Profile Widget -->
        <script src="/widget.js" data-widget="profile" data-theme="light" data-title="Your Profile"></script>
        
        <!-- Carbon Impact Widget -->
        <script src="/widget.js" data-widget="carbon-impact" data-theme="light" data-title="Eco-Parking Impact"></script>
      </div>
      
      <!-- Prepaid Cards Widget -->
      <script src="/widget.js" data-widget="prepaid-cards" data-theme="light" data-title="Your Payment Methods"></script>
    </section>

    <section class="features">
      <div class="feature-card">
        <div class="feature-icon">🔍</div>
        <h3>Find Parking Easily</h3>
        <p>Search for available parking spots near your destination in real-time. Filter by price, distance, and amenities.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">💳</div>
        <h3>Pay Seamlessly</h3>
        <p>Securely pay for parking in advance or extend your stay remotely through the app. No need for cash or parking meters.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🔔</div>
        <h3>Smart Notifications</h3>
        <p>Receive alerts when your parking is about to expire and extend your time directly from your phone.</p>
      </div>
    </section>

    <section class="parking-list">
      <h2>Popular Parking Locations</h2>
      
      <div class="parking-item">
        <div class="parking-details">
          <h3>Downtown Central Garage</h3>
          <p>123 Main Street • Open 24/7 • 85% full</p>
        </div>
        <div class="parking-price">$8/hr</div>
        <a href="#" class="btn reserve-btn">Reserve</a>
      </div>
      
      <div class="parking-item">
        <div class="parking-details">
          <h3>Riverside Underground Parking</h3>
          <p>45 River Road • Open 6AM-11PM • 40% full</p>
        </div>
        <div class="parking-price">$5/hr</div>
        <a href="#" class="btn reserve-btn">Reserve</a>
      </div>
      
      <div class="parking-item">
        <div class="parking-details">
          <h3>Convention Center Lot</h3>
          <p>789 Convention Way • Open 24/7 • 25% full</p>
        </div>
        <div class="parking-price">$12/hr</div>
        <a href="#" class="btn reserve-btn">Reserve</a>
      </div>
      
      <div class="parking-item">
        <div class="parking-details">
          <h3>Market Street Garage</h3>
          <p>567 Market Street • Open 5AM-12AM • 70% full</p>
        </div>
        <div class="parking-price">$7/hr</div>
        <a href="#" class="btn reserve-btn">Reserve</a>
      </div>
    </section>
  </main>

  <footer>
    <div class="footer-content">
      <p>&copy; 2025 EZPark. All rights reserved.</p>
      <ul class="footer-links">
        <li><a href="#">Terms of Service</a></li>
        <li><a href="#">Privacy Policy</a></li>
        <li><a href="#">Help Center</a></li>
        <li><a href="#">Contact Us</a></li>
      </ul>
      <p>Payments powered by PaySage Wallet</p>
    </div>
  </footer>
</body>
</html>`);
  });

  const httpServer = createServer(app);
  return httpServer;
}
