import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertBrandSettingsSchema, insertCardSchema, insertPrepaidCardSchema } from "@shared/schema";
import { walletClient } from "./wallet-client";
import { errorHandler } from "./diagnostics/error-tracking";

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
        return res.json({ 
          message: "Wallet already exists", 
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
          status: walletResponse.status || 'ACTIVE'
        });
        
        // Create accounts for the wallet if needed
        if (walletResponse.accounts && Array.isArray(walletResponse.accounts)) {
          for (const account of walletResponse.accounts) {
            await storage.addWalletAccount({
              walletId: wallet.id,
              accountId: account.id,
              currencyCode: account.currencyCode,
              externalId: account.externalId || null,
              hasVirtualInstrument: account.hasVirtualInstrument || false
            });
          }
        }
        
        await logApiCall(req, "Initialize wallet", 201, wallet);
        return res.status(201).json({
          message: "Wallet created successfully",
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

  const httpServer = createServer(app);
  return httpServer;
}
