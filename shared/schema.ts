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
  createdAt: timestamp("created_at").defaultNow(),
});

// Brand Settings Table
export const brandSettings = pgTable("brand_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("PaySage"),
  tagline: text("tagline").default("Your Digital Wallet Solution"),
  logo: text("logo"),
  walletAuthKey: text("wallet_auth_key"),
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
  timestamp: timestamp("timestamp").defaultNow(),
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
  .omit({ id: true, timestamp: true });

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
