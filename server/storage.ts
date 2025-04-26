import { users, brandSettings, customerWallets, walletAccounts, cards, systemLogs } from "@shared/schema";
import type { 
  User, InsertUser, BrandSettings, InsertBrandSettings, 
  CustomerWallet, InsertCustomerWallet, WalletAccount, InsertWalletAccount,
  Card, InsertCard, SystemLog, InsertSystemLog 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(isAdmin?: boolean): Promise<User[]>;
  
  // Brand settings operations
  getBrandSettings(): Promise<BrandSettings | undefined>;
  updateBrandSettings(data: Partial<InsertBrandSettings>): Promise<BrandSettings>;
  
  // Wallet operations
  getWalletByUserId(userId: number): Promise<CustomerWallet | undefined>;
  createWallet(wallet: InsertCustomerWallet): Promise<CustomerWallet>;
  
  // Wallet account operations
  getWalletAccounts(walletId: number): Promise<WalletAccount[]>;
  addWalletAccount(account: InsertWalletAccount): Promise<WalletAccount>;
  
  // Card operations
  getCardsByUserId(userId: number): Promise<Card[]>;
  addCard(card: InsertCard): Promise<Card>;
  deleteCard(id: number): Promise<boolean>;
  
  // Logs operations
  addSystemLog(log: InsertSystemLog): Promise<SystemLog>;
  getSystemLogs(limit?: number, offset?: number): Promise<SystemLog[]>;
  getSystemLogsByUserId(userId: number, limit?: number): Promise<SystemLog[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return !!deletedUser;
  }
  
  async listUsers(isAdmin?: boolean): Promise<User[]> {
    if (isAdmin !== undefined) {
      return db.select().from(users).where(eq(users.isAdmin, isAdmin));
    }
    return db.select().from(users);
  }
  
  // Brand settings operations
  async getBrandSettings(): Promise<BrandSettings | undefined> {
    const [settings] = await db.select().from(brandSettings).limit(1);
    return settings;
  }
  
  async updateBrandSettings(data: Partial<InsertBrandSettings>): Promise<BrandSettings> {
    const existingSettings = await this.getBrandSettings();
    
    if (existingSettings) {
      const [updated] = await db
        .update(brandSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(brandSettings.id, existingSettings.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(brandSettings)
        .values({ ...data, updatedAt: new Date() })
        .returning();
      return created;
    }
  }
  
  // Wallet operations
  async getWalletByUserId(userId: number): Promise<CustomerWallet | undefined> {
    const [wallet] = await db
      .select()
      .from(customerWallets)
      .where(eq(customerWallets.userId, userId));
    return wallet;
  }
  
  async createWallet(wallet: InsertCustomerWallet): Promise<CustomerWallet> {
    const [created] = await db
      .insert(customerWallets)
      .values(wallet)
      .returning();
    return created;
  }
  
  // Wallet account operations
  async getWalletAccounts(walletId: number): Promise<WalletAccount[]> {
    return db
      .select()
      .from(walletAccounts)
      .where(eq(walletAccounts.walletId, walletId));
  }
  
  async addWalletAccount(account: InsertWalletAccount): Promise<WalletAccount> {
    const [created] = await db
      .insert(walletAccounts)
      .values(account)
      .returning();
    return created;
  }
  
  // Card operations
  async getCardsByUserId(userId: number): Promise<Card[]> {
    return db
      .select()
      .from(cards)
      .where(eq(cards.userId, userId));
  }
  
  async addCard(card: InsertCard): Promise<Card> {
    const [created] = await db
      .insert(cards)
      .values(card)
      .returning();
    return created;
  }
  
  async deleteCard(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(cards)
      .where(eq(cards.id, id))
      .returning();
    return !!deleted;
  }
  
  // Logs operations
  async addSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const [created] = await db
      .insert(systemLogs)
      .values(log)
      .returning();
    return created;
  }
  
  async getSystemLogs(limit: number = 100, offset: number = 0): Promise<SystemLog[]> {
    return db
      .select()
      .from(systemLogs)
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getSystemLogsByUserId(userId: number, limit: number = 10): Promise<SystemLog[]> {
    return db
      .select()
      .from(systemLogs)
      .where(eq(systemLogs.userId, userId))
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
