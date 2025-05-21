import { pgTable, text, serial, integer, boolean, json, timestamp, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import tenant schema
export * from "./schema-tenant";

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
  name: text("name").notNull().default("PaySage Wallet"),
  tagline: text("tagline").default("Your Digital Wallet Solution"),
  logo: text("logo"),
  iconUrl: text("icon_url"), // Added icon URL for brand
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
    maxPrepaidCards: 3, // Default limit for prepaid cards
    maxTransferAmount: 10000 * 100, // in cents
    defaultCommissionRate: 0.5, // percentage
    retentionPeriodDays: 7, // for system logs
  })),
  tenantId: integer("tenant_id"),
  isDefault: boolean("is_default").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Wallets Table
export const customerWallets = pgTable("customer_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  customerId: text("customer_id").notNull().unique(),
  externalReference: text("external_reference"),
  status: text("status").default("ACTIVE"),
  metadata: json("metadata"), // For storing tenant ID and other metadata
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

// Budget Categories Table
export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6366F1"), // Default color
  icon: text("icon"),
  parentId: integer("parent_id"), // Will reference budgetCategories.id via relation
  userId: integer("user_id").references(() => users.id), // For custom categories
  isSystem: boolean("is_system").default(false), // True for system categories
  metadata: json("metadata"), // For storing tenant ID and other metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Budget Plans Table
export const budgetPlans = pgTable("budget_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  currencyCode: text("currency_code").notNull().default("USD"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  metadata: json("metadata"), // For storing tenant ID and other metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Budget Allocations Table
export const budgetAllocations = pgTable("budget_allocations", {
  id: serial("id").primaryKey(),
  budgetPlanId: integer("budget_plan_id").notNull().references(() => budgetPlans.id),
  categoryId: integer("category_id").notNull().references(() => budgetCategories.id),
  allocatedAmount: decimal("allocated_amount", { precision: 10, scale: 2 }).notNull(),
  spentAmount: decimal("spent_amount", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Budget Transactions Table
export const budgetTransactions = pgTable("budget_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => budgetCategories.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  transactionDate: timestamp("transaction_date").notNull().defaultNow(),
  walletTransactionId: text("wallet_transaction_id"), // For linking to wallet transactions
  isIncome: boolean("is_income").default(false),
  metadata: json("metadata"), // For storing tenant ID and other metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBudgetCategorySchema = createInsertSchema(budgetCategories)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const insertBudgetPlanSchema = createInsertSchema(budgetPlans)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const insertBudgetAllocationSchema = createInsertSchema(budgetAllocations)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const insertBudgetTransactionSchema = createInsertSchema(budgetTransactions)
  .omit({ id: true, createdAt: true });

export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type BudgetCategory = typeof budgetCategories.$inferSelect;

export type InsertBudgetPlan = z.infer<typeof insertBudgetPlanSchema>;
export type BudgetPlan = typeof budgetPlans.$inferSelect;

export type InsertBudgetAllocation = z.infer<typeof insertBudgetAllocationSchema>;
export type BudgetAllocation = typeof budgetAllocations.$inferSelect;

export type InsertBudgetTransaction = z.infer<typeof insertBudgetTransactionSchema>;
export type BudgetTransaction = typeof budgetTransactions.$inferSelect;

// Prepaid Cards Table
export const prepaidCards = pgTable("prepaid_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  cardNumber: text("card_number").notNull(),
  last4: text("last4").notNull(),
  expiryMonth: text("expiry_month").notNull(),
  expiryYear: text("expiry_year").notNull(),
  cardholderName: text("cardholder_name").notNull(),
  cardType: text("card_type").default("MASTERCARD").notNull(),
  status: text("status").default("ACTIVE").notNull(), // ACTIVE, SUSPENDED, BLOCKED
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  currencyCode: text("currency_code").default("USD").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPrepaidCardSchema = createInsertSchema(prepaidCards)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertPrepaidCard = z.infer<typeof insertPrepaidCardSchema>;
export type PrepaidCard = typeof prepaidCards.$inferSelect;

// PhantomPay-Sandbox System Tables

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
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"), // Balance as decimal with 2 decimal places
  createdAt: timestamp("created_at").defaultNow(),
});

// PhantomPay Transactions Table
export const phantomTransactions = pgTable("phantom_transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(), // Mock transaction ID format: "phantom-tx-xxxxx"
  sourceAccountId: integer("source_account_id").references(() => phantomAccounts.id),
  destinationAccountId: integer("destination_account_id").references(() => phantomAccounts.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Amount as decimal with 2 decimal places
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

// Carbon Impact Tracking Table
export const carbonImpacts = pgTable("carbon_impacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  transactionId: text("transaction_id").notNull(), // References a wallet transaction ID
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Transaction amount
  category: text("category").notNull(), // Purchase category (e.g., travel, food, electronics)
  carbonFootprint: decimal("carbon_footprint", { precision: 10, scale: 4 }).notNull(), // in kg of CO2
  carbonSavings: decimal("carbon_savings", { precision: 10, scale: 4 }).default("0"), // potential savings
  suggestionApplied: boolean("suggestion_applied").default(false), 
  transactionDate: timestamp("transaction_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Carbon Offset Contributions Table
export const carbonOffsets = pgTable("carbon_offsets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Financial contribution
  offsetAmount: decimal("offset_amount", { precision: 10, scale: 4 }).notNull(), // in kg of CO2
  projectName: text("project_name").notNull(), // Name of the offset project
  projectDescription: text("project_description"),
  contributionDate: timestamp("contribution_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Carbon Impact Metadata for Categories
export const carbonCategories = pgTable("carbon_categories", {
  id: serial("id").primaryKey(),
  category: text("category").notNull().unique(), // e.g., "groceries", "flights", "electronics"
  averageCarbonPerDollar: decimal("average_carbon_per_dollar", { precision: 10, scale: 6 }).notNull(), // kg CO2 per $
  description: text("description"),
  icon: text("icon"),
  tips: json("tips").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Carbon Preferences
export const carbonPreferences = pgTable("carbon_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  trackingEnabled: boolean("tracking_enabled").default(true),
  showSuggestions: boolean("show_suggestions").default(true),
  monthlyOffsetTarget: decimal("monthly_offset_target", { precision: 10, scale: 2 }), // Optional target
  preferredCategories: json("preferred_categories").default([]), // Categories to focus on
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema definitions for carbon tracking inserts
export const insertCarbonImpactSchema = createInsertSchema(carbonImpacts)
  .omit({ id: true, createdAt: true });

export const insertCarbonOffsetSchema = createInsertSchema(carbonOffsets)
  .omit({ id: true, createdAt: true });

export const insertCarbonCategorySchema = createInsertSchema(carbonCategories)
  .omit({ id: true, createdAt: true });

export const insertCarbonPreferenceSchema = createInsertSchema(carbonPreferences)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Types for carbon tracking inserts and selects
export type InsertCarbonImpact = z.infer<typeof insertCarbonImpactSchema>;
export type CarbonImpact = typeof carbonImpacts.$inferSelect;

export type InsertCarbonOffset = z.infer<typeof insertCarbonOffsetSchema>;
export type CarbonOffset = typeof carbonOffsets.$inferSelect;

export type InsertCarbonCategory = z.infer<typeof insertCarbonCategorySchema>;
export type CarbonCategory = typeof carbonCategories.$inferSelect;

export type InsertCarbonPreference = z.infer<typeof insertCarbonPreferenceSchema>;
export type CarbonPreference = typeof carbonPreferences.$inferSelect;

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
