import { pgTable, text, serial, integer, boolean, json, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  country: text("country"),
  profilePhoto: text("profile_photo"),
  defaultCurrency: text("default_currency").default("USD"),
  isAdmin: boolean("is_admin").default(false),
  isPhantomUser: boolean("is_phantom_user").default(false), // Flag to indicate if using PhantomPay mock system
  phantomUserId: text("phantom_user_id"), // Reference ID for PhantomPay system
  createdAt: timestamp("created_at").defaultNow(),
});

// Brand Settings Table
export const brandSettings = pgTable("brand_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("PaySage"),
  tagline: text("tagline").default("Your Digital Wallet Solution"),
  logo: text("logo"),
  walletAuthKey: text("wallet_auth_key"),
  // Wallet feature configurations
  walletConfig: json("wallet_config").$defaultFn(() => ({
    transactionDisplayCount: 10,
    allowedCurrencies: ["USD", "EUR", "GBP"],
    maxNegativeBalance: 0, // 0 means not allowed
    enableAnalytics: true,
    enableBulkTransfers: true,
    enableTestCards: true,
    maxTestCards: 5,
    maxTransferAmount: 10000 * 100, // in cents
    defaultCommissionRate: 0.5, // percentage
    retentionPeriodDays: 7, // for system logs
  })),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Wallets Table
export const customerWallets = pgTable("customer_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  customerId: text("customer_id").notNull().unique(),
  externalReference: text("external_reference"),
  status: text("status").default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallet Accounts Table
export const walletAccounts = pgTable("wallet_accounts", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => customerWallets.id),
  accountId: text("account_id").notNull(),
  currencyCode: text("currency_code").notNull(),
  externalId: text("external_id"),
  hasVirtualInstrument: boolean("has_virtual_instrument").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cards Table
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  cardType: text("card_type").notNull(), // VISA, MASTERCARD, etc.
  last4: text("last4").notNull(),
  expiryMonth: text("expiry_month").notNull(),
  expiryYear: text("expiry_year").notNull(),
  cardholderName: text("cardholder_name"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Logs Table
export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: text("action").notNull(),
  statusCode: integer("status_code"),
  requestData: json("request_data"),
  responseData: json("response_data"),
  details: json("details"),
  source: text("source"),
  component: text("component"),
  level: text("level"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema definitions for inserts
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

export const insertBrandSettingsSchema = createInsertSchema(brandSettings)
  .omit({ id: true, updatedAt: true });

export const insertCustomerWalletSchema = createInsertSchema(customerWallets)
  .omit({ id: true, createdAt: true });

export const insertWalletAccountSchema = createInsertSchema(walletAccounts)
  .omit({ id: true, createdAt: true });

export const insertCardSchema = createInsertSchema(cards)
  .omit({ id: true, createdAt: true });

export const insertSystemLogSchema = createInsertSchema(systemLogs)
  .omit({ id: true, createdAt: true });

// Types for inserts and selects
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBrandSettings = z.infer<typeof insertBrandSettingsSchema>;
export type BrandSettings = typeof brandSettings.$inferSelect;

export type InsertCustomerWallet = z.infer<typeof insertCustomerWalletSchema>;
export type CustomerWallet = typeof customerWallets.$inferSelect;

export type InsertWalletAccount = z.infer<typeof insertWalletAccountSchema>;
export type WalletAccount = typeof walletAccounts.$inferSelect;

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;

export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;

// PhantomPay Mock System Tables

// PhantomPay Wallets Table
export const phantomWallets = pgTable("phantom_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  walletId: text("wallet_id").notNull().unique(), // Mock wallet ID format: "phantom-xxxxxx"
  status: text("status").default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow(),
});

// PhantomPay Accounts Table (one per currency)
export const phantomAccounts = pgTable("phantom_accounts", {
  id: serial("id").primaryKey(),
  phantomWalletId: integer("phantom_wallet_id").notNull().references(() => phantomWallets.id),
  accountId: text("account_id").notNull().unique(), // Mock account ID format: "phantom-acct-xxxxx"
  currencyCode: text("currency_code").notNull(),
  balance: integer("balance").default(0), // Balance stored in cents/pennies
  createdAt: timestamp("created_at").defaultNow(),
});

// PhantomPay Transactions Table
export const phantomTransactions = pgTable("phantom_transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(), // Mock transaction ID format: "phantom-tx-xxxxx"
  sourceAccountId: integer("source_account_id").references(() => phantomAccounts.id),
  destinationAccountId: integer("destination_account_id").references(() => phantomAccounts.id),
  amount: integer("amount").notNull(), // Amount in cents/pennies
  currencyCode: text("currency_code").notNull(),
  type: text("type").notNull(), // 'DEPOSIT', 'TRANSFER', 'WITHDRAWAL'
  status: text("status").default("COMPLETED"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema definitions for PhantomPay inserts
export const insertPhantomWalletSchema = createInsertSchema(phantomWallets)
  .omit({ id: true, createdAt: true });

export const insertPhantomAccountSchema = createInsertSchema(phantomAccounts)
  .omit({ id: true, createdAt: true });

export const insertPhantomTransactionSchema = createInsertSchema(phantomTransactions)
  .omit({ id: true, createdAt: true });

// Types for PhantomPay inserts and selects
export type InsertPhantomWallet = z.infer<typeof insertPhantomWalletSchema>;
export type PhantomWallet = typeof phantomWallets.$inferSelect;

export type InsertPhantomAccount = z.infer<typeof insertPhantomAccountSchema>;
export type PhantomAccount = typeof phantomAccounts.$inferSelect;

export type InsertPhantomTransaction = z.infer<typeof insertPhantomTransactionSchema>;
export type PhantomTransaction = typeof phantomTransactions.$inferSelect;

// Other types needed for the application
export type TransactionType = 'DEPOSIT' | 'TRANSFER' | 'WITHDRAWAL';

export type Currency = {
  code: string;
  name: string;
  symbol: string;
};

export const supportedCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' }
];
