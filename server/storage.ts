import { 
  users, brandSettings, customerWallets, walletAccounts, cards, prepaidCards, systemLogs,
  budgetCategories, budgetPlans, budgetAllocations, budgetTransactions,
  carbonImpacts, carbonOffsets, carbonCategories, carbonPreferences,
  tenants, userTenants
} from "@shared/schema";
import type { 
  User, InsertUser, BrandSettings, InsertBrandSettings, 
  CustomerWallet, InsertCustomerWallet, WalletAccount, InsertWalletAccount,
  Card, InsertCard, PrepaidCard, InsertPrepaidCard, SystemLog, InsertSystemLog,
  BudgetCategory, InsertBudgetCategory, BudgetPlan, InsertBudgetPlan,
  BudgetAllocation, InsertBudgetAllocation, BudgetTransaction, InsertBudgetTransaction,
  CarbonImpact, InsertCarbonImpact, CarbonOffset, InsertCarbonOffset,
  CarbonCategory, InsertCarbonCategory, CarbonPreference, InsertCarbonPreference,
  Tenant, InsertTenant, UserTenant, InsertUserTenant
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, not, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import type { Store } from "express-session";

const PostgresSessionStore = connectPg(session);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(isAdmin?: boolean, tenantId?: number): Promise<User[]>;
  
  // Tenant operations
  getTenants(): Promise<Tenant[]>;
  getTenantById(id: number): Promise<Tenant | undefined>;
  getTenantBySlug(tenantId: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: number, data: Partial<InsertTenant>): Promise<Tenant | undefined>;
  deleteTenant(id: number): Promise<boolean>;
  
  // User-Tenant operations
  getUserTenants(userId: number): Promise<(UserTenant & { tenant: Tenant })[]>;
  getUsersInTenant(tenantId: number, role?: string): Promise<(UserTenant & { user: User })[]>;
  getUserTenantRole(userId: number, tenantId: number): Promise<string | undefined>;
  addUserToTenant(userTenant: InsertUserTenant): Promise<UserTenant>;
  updateUserTenantRole(userId: number, tenantId: number, role: string): Promise<UserTenant | undefined>;
  removeUserFromTenant(userId: number, tenantId: number): Promise<boolean>;
  setDefaultTenant(userId: number, tenantId: number): Promise<boolean>;
  
  // Brand settings operations (per tenant)
  getBrandSettings(tenantId?: number): Promise<BrandSettings | undefined>;
  updateBrandSettings(data: Partial<InsertBrandSettings>, tenantId?: number): Promise<BrandSettings>;
  
  // Wallet operations
  getWalletByUserId(userId: number): Promise<CustomerWallet | undefined>;
  createWallet(wallet: InsertCustomerWallet): Promise<CustomerWallet>;
  updateWallet(id: number, data: Partial<InsertCustomerWallet>): Promise<CustomerWallet | undefined>;
  
  // Wallet account operations
  getWalletAccounts(walletId: number): Promise<WalletAccount[]>;
  addWalletAccount(account: InsertWalletAccount): Promise<WalletAccount>;
  
  // Card operations
  getCardsByUserId(userId: number): Promise<Card[]>;
  addCard(card: InsertCard): Promise<Card>;
  updateCard(id: number, data: Partial<InsertCard>): Promise<Card | undefined>;
  deleteCard(id: number): Promise<boolean>;
  
  // Prepaid card operations
  getPrepaidCardsByUserId(userId: number): Promise<PrepaidCard[]>;
  getPrepaidCardById(id: number): Promise<PrepaidCard | undefined>;
  addPrepaidCard(card: InsertPrepaidCard): Promise<PrepaidCard>;
  updatePrepaidCard(id: number, data: Partial<InsertPrepaidCard>): Promise<PrepaidCard | undefined>;
  deletePrepaidCard(id: number): Promise<boolean>;
  
  // Budget operations
  getBudgetCategories(userId?: number): Promise<BudgetCategory[]>;
  getBudgetCategory(id: number): Promise<BudgetCategory | undefined>;
  createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory>;
  updateBudgetCategory(id: number, data: Partial<InsertBudgetCategory>): Promise<BudgetCategory | undefined>;
  deleteBudgetCategory(id: number): Promise<boolean>;
  
  getBudgetPlans(userId: number): Promise<BudgetPlan[]>;
  getActiveBudgetPlan(userId: number): Promise<BudgetPlan | undefined>;
  getBudgetPlan(id: number): Promise<BudgetPlan | undefined>;
  createBudgetPlan(plan: InsertBudgetPlan): Promise<BudgetPlan>;
  updateBudgetPlan(id: number, data: Partial<InsertBudgetPlan>): Promise<BudgetPlan | undefined>;
  deleteBudgetPlan(id: number): Promise<boolean>;
  
  getBudgetAllocations(budgetPlanId: number): Promise<BudgetAllocation[]>;
  createBudgetAllocation(allocation: InsertBudgetAllocation): Promise<BudgetAllocation>;
  updateBudgetAllocation(id: number, data: Partial<InsertBudgetAllocation>): Promise<BudgetAllocation | undefined>;
  
  getBudgetTransactions(userId: number, limit?: number): Promise<BudgetTransaction[]>;
  createBudgetTransaction(transaction: InsertBudgetTransaction): Promise<BudgetTransaction>;
  
  // Logs operations
  addSystemLog(log: InsertSystemLog): Promise<SystemLog>;
  getSystemLogs(limit?: number, offset?: number): Promise<SystemLog[]>;
  getSystemLogsByUserId(userId: number, limit?: number): Promise<SystemLog[]>;
  
  // Carbon impact operations
  getCarbonCategories(): Promise<CarbonCategory[]>;
  getCarbonCategoryByName(category: string): Promise<CarbonCategory | undefined>;
  
  getUserCarbonPreference(userId: number): Promise<CarbonPreference | undefined>;
  createOrUpdateCarbonPreference(userId: number, data: Partial<InsertCarbonPreference>): Promise<CarbonPreference>;
  
  recordCarbonImpact(impact: InsertCarbonImpact): Promise<CarbonImpact>;
  getUserCarbonImpacts(userId: number, limit?: number): Promise<CarbonImpact[]>;
  
  recordCarbonOffset(offset: InsertCarbonOffset): Promise<CarbonOffset>;
  getUserCarbonOffsets(userId: number, limit?: number): Promise<CarbonOffset[]>;
  
  getUserCarbonSummary(userId: number, days?: number): Promise<{
    totalImpact: number;
    totalOffset: number;
    netImpact: number;
    impactByCategory: Record<string, number>;
    monthlyAverage: number;
  }>;
  
  // Session store
  sessionStore: Store;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: Store;
  
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
  
  async listUsers(isAdmin?: boolean, tenantId?: number): Promise<User[]> {
    if (tenantId) {
      // If tenantId is provided, get users from the specified tenant
      const userTenantRecords = await db
        .select({ user: users })
        .from(userTenants)
        .innerJoin(users, eq(userTenants.userId, users.id))
        .where(eq(userTenants.tenantId, tenantId));
      
      // If isAdmin is specified, filter by that as well
      return userTenantRecords
        .map(record => record.user)
        .filter(user => isAdmin === undefined || user.isAdmin === isAdmin);
    } else {
      // Otherwise, get all users (with optional isAdmin filter)
      if (isAdmin !== undefined) {
        return db.select().from(users).where(eq(users.isAdmin, isAdmin));
      }
      return db.select().from(users);
    }
  }
  
  // Tenant operations
  async getTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants);
  }

  async getTenantById(id: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenantBySlug(tenantId: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.tenantId, tenantId));
    return tenant;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values(tenant).returning();
    return newTenant;
  }

  async updateTenant(id: number, data: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const [updatedTenant] = await db
      .update(tenants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return updatedTenant;
  }

  async deleteTenant(id: number): Promise<boolean> {
    // First check if the tenant has any users
    const userTenantCount = await db
      .select()
      .from(userTenants)
      .where(eq(userTenants.tenantId, id));
    
    if (userTenantCount.length > 0) {
      throw new Error("Cannot delete tenant with associated users");
    }
    
    await db.delete(tenants).where(eq(tenants.id, id));
    return true;
  }
  
  // User-Tenant operations
  async getUserTenants(userId: number): Promise<(UserTenant & { tenant: Tenant })[]> {
    return await db
      .select({
        id: userTenants.id,
        userId: userTenants.userId,
        tenantId: userTenants.tenantId,
        role: userTenants.role,
        isDefault: userTenants.isDefault,
        createdAt: userTenants.createdAt,
        tenant: tenants
      })
      .from(userTenants)
      .innerJoin(tenants, eq(userTenants.tenantId, tenants.id))
      .where(eq(userTenants.userId, userId));
  }

  async getUsersInTenant(tenantId: number, role?: string): Promise<(UserTenant & { user: User })[]> {
    if (role) {
      return await db
        .select({
          id: userTenants.id,
          userId: userTenants.userId,
          tenantId: userTenants.tenantId,
          role: userTenants.role,
          isDefault: userTenants.isDefault,
          createdAt: userTenants.createdAt,
          user: users
        })
        .from(userTenants)
        .innerJoin(users, eq(userTenants.userId, users.id))
        .where(and(
          eq(userTenants.tenantId, tenantId),
          eq(userTenants.role, role)
        ));
    } else {
      return await db
        .select({
          id: userTenants.id,
          userId: userTenants.userId,
          tenantId: userTenants.tenantId,
          role: userTenants.role,
          isDefault: userTenants.isDefault,
          createdAt: userTenants.createdAt,
          user: users
        })
        .from(userTenants)
        .innerJoin(users, eq(userTenants.userId, users.id))
        .where(eq(userTenants.tenantId, tenantId));
    }
  }

  async getUserTenantRole(userId: number, tenantId: number): Promise<string | undefined> {
    const [userTenant] = await db
      .select({ role: userTenants.role })
      .from(userTenants)
      .where(and(
        eq(userTenants.userId, userId),
        eq(userTenants.tenantId, tenantId)
      ));
    
    return userTenant?.role;
  }

  async addUserToTenant(userTenant: InsertUserTenant): Promise<UserTenant> {
    // Check if this is the first tenant for this user
    const existingTenants = await db
      .select()
      .from(userTenants)
      .where(eq(userTenants.userId, userTenant.userId));
    
    // If this is the first tenant, set it as default
    const isDefault = existingTenants.length === 0 ? true : userTenant.isDefault || false;
    
    // If isDefault is true, set all other tenants for this user to isDefault=false
    if (isDefault) {
      await db
        .update(userTenants)
        .set({ isDefault: false })
        .where(eq(userTenants.userId, userTenant.userId));
    }
    
    const [newUserTenant] = await db
      .insert(userTenants)
      .values({ ...userTenant, isDefault })
      .returning();
    
    return newUserTenant;
  }

  async updateUserTenantRole(userId: number, tenantId: number, role: string): Promise<UserTenant | undefined> {
    const [updatedUserTenant] = await db
      .update(userTenants)
      .set({ role })
      .where(and(
        eq(userTenants.userId, userId),
        eq(userTenants.tenantId, tenantId)
      ))
      .returning();
    
    return updatedUserTenant;
  }

  async removeUserFromTenant(userId: number, tenantId: number): Promise<boolean> {
    // Before removing, check if this is the default tenant for the user
    const [userTenant] = await db
      .select()
      .from(userTenants)
      .where(and(
        eq(userTenants.userId, userId),
        eq(userTenants.tenantId, tenantId)
      ));
    
    // Delete the user-tenant relationship
    await db
      .delete(userTenants)
      .where(and(
        eq(userTenants.userId, userId),
        eq(userTenants.tenantId, tenantId)
      ));
    
    // If the deleted tenant was the default, set a new default if possible
    if (userTenant?.isDefault) {
      const [remainingTenant] = await db
        .select()
        .from(userTenants)
        .where(eq(userTenants.userId, userId))
        .limit(1);
      
      if (remainingTenant) {
        await db
          .update(userTenants)
          .set({ isDefault: true })
          .where(eq(userTenants.id, remainingTenant.id));
      }
    }
    
    return true;
  }

  async setDefaultTenant(userId: number, tenantId: number): Promise<boolean> {
    // First, check if the user is part of the tenant
    const [userTenant] = await db
      .select()
      .from(userTenants)
      .where(and(
        eq(userTenants.userId, userId),
        eq(userTenants.tenantId, tenantId)
      ));
    
    if (!userTenant) {
      throw new Error("User is not part of the specified tenant");
    }
    
    // Set all tenants for this user to isDefault=false
    await db
      .update(userTenants)
      .set({ isDefault: false })
      .where(eq(userTenants.userId, userId));
    
    // Set the specified tenant as default
    await db
      .update(userTenants)
      .set({ isDefault: true })
      .where(and(
        eq(userTenants.userId, userId),
        eq(userTenants.tenantId, tenantId)
      ));
    
    return true;
  }
  
  // Brand settings operations (per tenant)
  async getBrandSettings(tenantId?: number): Promise<BrandSettings | undefined> {
    if (tenantId) {
      // Get brand settings for specific tenant
      const [settings] = await db
        .select()
        .from(brandSettings)
        .where(eq(brandSettings.tenantId, tenantId))
        .limit(1);
      return settings;
    } else {
      // Legacy support - get the default brand settings
      const [settings] = await db
        .select()
        .from(brandSettings)
        .where(eq(brandSettings.isDefault, true))
        .limit(1);
      
      if (settings) return settings;
      
      // If no default found, get the first one
      const [firstSettings] = await db
        .select()
        .from(brandSettings)
        .limit(1);
      return firstSettings;
    }
  }
  
  async updateBrandSettings(data: Partial<InsertBrandSettings>, tenantId?: number): Promise<BrandSettings> {
    if (tenantId) {
      // Update or create tenant-specific brand settings
      const existingSettings = await this.getBrandSettings(tenantId);
      
      if (existingSettings) {
        const [updated] = await db
          .update(brandSettings)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(brandSettings.id, existingSettings.id))
          .returning();
        return updated;
      } else {
        // Create new tenant-specific settings
        const [created] = await db
          .insert(brandSettings)
          .values({ 
            ...data, 
            tenantId, 
            isDefault: false,
            updatedAt: new Date() 
          })
          .returning();
        return created;
      }
    } else {
      // Update or create default brand settings
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
          .values({ 
            ...data, 
            isDefault: true,
            updatedAt: new Date() 
          })
          .returning();
        return created;
      }
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
  
  async updateWallet(id: number, data: Partial<InsertCustomerWallet>): Promise<CustomerWallet | undefined> {
    const [updated] = await db
      .update(customerWallets)
      .set(data)
      .where(eq(customerWallets.id, id))
      .returning();
    return updated;
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
  
  async updateCard(id: number, data: Partial<InsertCard>): Promise<Card | undefined> {
    const [updated] = await db
      .update(cards)
      .set(data)
      .where(eq(cards.id, id))
      .returning();
    return updated;
  }
  
  async deleteCard(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(cards)
      .where(eq(cards.id, id))
      .returning();
    return !!deleted;
  }
  
  // Prepaid card operations
  async getPrepaidCardsByUserId(userId: number): Promise<PrepaidCard[]> {
    return db
      .select()
      .from(prepaidCards)
      .where(eq(prepaidCards.userId, userId));
  }
  
  async getPrepaidCardById(id: number): Promise<PrepaidCard | undefined> {
    const [card] = await db
      .select()
      .from(prepaidCards)
      .where(eq(prepaidCards.id, id));
    return card;
  }
  
  async addPrepaidCard(card: InsertPrepaidCard): Promise<PrepaidCard> {
    // If setting this card as default, remove default flag from other cards
    if (card.isDefault) {
      await db
        .update(prepaidCards)
        .set({ isDefault: false })
        .where(eq(prepaidCards.userId, card.userId));
    }
    
    const [created] = await db
      .insert(prepaidCards)
      .values(card)
      .returning();
    return created;
  }
  
  async updatePrepaidCard(id: number, data: Partial<InsertPrepaidCard>): Promise<PrepaidCard | undefined> {
    // If setting this card as default, remove default flag from other cards
    if (data.isDefault) {
      const card = await this.getPrepaidCardById(id);
      if (card) {
        await db
          .update(prepaidCards)
          .set({ isDefault: false })
          .where(
            and(
              eq(prepaidCards.userId, card.userId),
              not(eq(prepaidCards.id, id))
            )
          );
      }
    }
    
    const [updated] = await db
      .update(prepaidCards)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(prepaidCards.id, id))
      .returning();
    return updated;
  }
  
  async deletePrepaidCard(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(prepaidCards)
      .where(eq(prepaidCards.id, id))
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
    // Get current date minus 7 days for retention policy
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return db
      .select()
      .from(systemLogs)
      .where(
        gte(systemLogs.createdAt, sevenDaysAgo)
      )
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getSystemLogsByUserId(userId: number, limit: number = 10): Promise<SystemLog[]> {
    // Get current date minus 7 days for retention policy
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return db
      .select()
      .from(systemLogs)
      .where(
        and(
          eq(systemLogs.userId, userId),
          gte(systemLogs.createdAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit);
  }

  // Budget Categories operations
  async getBudgetCategories(userId?: number): Promise<BudgetCategory[]> {
    if (userId) {
      // Get system categories + user's custom categories
      return db
        .select()
        .from(budgetCategories)
        .where(
          or(
            eq(budgetCategories.isSystem, true),
            eq(budgetCategories.userId, userId)
          )
        );
    } else {
      // Get all categories
      return db
        .select()
        .from(budgetCategories);
    }
  }

  async getBudgetCategory(id: number): Promise<BudgetCategory | undefined> {
    const [category] = await db
      .select()
      .from(budgetCategories)
      .where(eq(budgetCategories.id, id));
    return category;
  }

  async createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory> {
    const [created] = await db
      .insert(budgetCategories)
      .values(category)
      .returning();
    return created;
  }

  async updateBudgetCategory(id: number, data: Partial<InsertBudgetCategory>): Promise<BudgetCategory | undefined> {
    const [updated] = await db
      .update(budgetCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(budgetCategories.id, id))
      .returning();
    return updated;
  }

  async deleteBudgetCategory(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(budgetCategories)
      .where(eq(budgetCategories.id, id))
      .returning();
    return !!deleted;
  }

  // Budget Plans operations
  async getBudgetPlans(userId: number): Promise<BudgetPlan[]> {
    return db
      .select()
      .from(budgetPlans)
      .where(eq(budgetPlans.userId, userId));
  }

  async getActiveBudgetPlan(userId: number): Promise<BudgetPlan | undefined> {
    const [plan] = await db
      .select()
      .from(budgetPlans)
      .where(
        and(
          eq(budgetPlans.userId, userId),
          eq(budgetPlans.isActive, true)
        )
      );
    return plan;
  }

  async getBudgetPlan(id: number): Promise<BudgetPlan | undefined> {
    const [plan] = await db
      .select()
      .from(budgetPlans)
      .where(eq(budgetPlans.id, id));
    return plan;
  }

  async createBudgetPlan(plan: InsertBudgetPlan): Promise<BudgetPlan> {
    // If setting this plan as active, deactivate all other plans for this user
    if (plan.isActive) {
      await db
        .update(budgetPlans)
        .set({ isActive: false })
        .where(eq(budgetPlans.userId, plan.userId));
    }

    const [created] = await db
      .insert(budgetPlans)
      .values(plan)
      .returning();
    return created;
  }

  async updateBudgetPlan(id: number, data: Partial<InsertBudgetPlan>): Promise<BudgetPlan | undefined> {
    // If setting this plan as active, deactivate all other plans for this user
    if (data.isActive) {
      const plan = await this.getBudgetPlan(id);
      if (plan) {
        await db
          .update(budgetPlans)
          .set({ isActive: false })
          .where(
            and(
              eq(budgetPlans.userId, plan.userId),
              not(eq(budgetPlans.id, id))
            )
          );
      }
    }

    const [updated] = await db
      .update(budgetPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(budgetPlans.id, id))
      .returning();
    return updated;
  }

  async deleteBudgetPlan(id: number): Promise<boolean> {
    // First delete all allocations for this plan
    await db
      .delete(budgetAllocations)
      .where(eq(budgetAllocations.budgetPlanId, id));

    const [deleted] = await db
      .delete(budgetPlans)
      .where(eq(budgetPlans.id, id))
      .returning();
    return !!deleted;
  }

  // Budget Allocations operations
  async getBudgetAllocations(budgetPlanId: number): Promise<BudgetAllocation[]> {
    return db
      .select()
      .from(budgetAllocations)
      .where(eq(budgetAllocations.budgetPlanId, budgetPlanId));
  }

  async createBudgetAllocation(allocation: InsertBudgetAllocation): Promise<BudgetAllocation> {
    const [created] = await db
      .insert(budgetAllocations)
      .values(allocation)
      .returning();
    return created;
  }

  async updateBudgetAllocation(id: number, data: Partial<InsertBudgetAllocation>): Promise<BudgetAllocation | undefined> {
    // Convert numeric values to strings for decimal fields if needed
    if (data.spentAmount !== undefined && typeof data.spentAmount === 'number') {
      data.spentAmount = String(data.spentAmount);
    }
    if (data.allocatedAmount !== undefined && typeof data.allocatedAmount === 'number') {
      data.allocatedAmount = String(data.allocatedAmount);
    }
    
    const [updated] = await db
      .update(budgetAllocations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(budgetAllocations.id, id))
      .returning();
    return updated;
  }

  // Budget Transactions operations
  async getBudgetTransactions(userId: number, limit: number = 50): Promise<BudgetTransaction[]> {
    return db
      .select()
      .from(budgetTransactions)
      .where(eq(budgetTransactions.userId, userId))
      .orderBy(desc(budgetTransactions.transactionDate))
      .limit(limit);
  }

  async createBudgetTransaction(transaction: InsertBudgetTransaction, tenantId?: number): Promise<BudgetTransaction> {
    // Get user's tenant information if tenantId is provided
    let effectiveTenantId = tenantId;
    
    if (!effectiveTenantId) {
      // If no tenantId is provided, try to get the user's default tenant
      try {
        const userTenants = await this.getUserTenants(transaction.userId);
        const defaultTenant = userTenants.find(ut => ut.isDefault);
        if (defaultTenant) {
          effectiveTenantId = defaultTenant.tenantId;
        }
      } catch (error) {
        // If there's an error getting tenant info, continue without it
        console.warn("Could not determine tenant for budget transaction:", error);
      }
    }
    
    // Create transaction with tenant metadata if available
    const transactionMetadata = transaction.metadata || {};
    if (effectiveTenantId) {
      transactionMetadata.tenantId = effectiveTenantId;
    }
    
    const [created] = await db
      .insert(budgetTransactions)
      .values({
        ...transaction,
        metadata: Object.keys(transactionMetadata).length > 0 ? transactionMetadata : undefined
      })
      .returning();

    // If this is an expense (not income), update the spent amount for the active budget
    if (!transaction.isIncome) {
      const activePlan = await this.getActiveBudgetPlan(transaction.userId);
      if (activePlan) {
        // Find allocation for this category in the active budget
        const [allocation] = await db
          .select()
          .from(budgetAllocations)
          .where(
            and(
              eq(budgetAllocations.budgetPlanId, activePlan.id),
              eq(budgetAllocations.categoryId, transaction.categoryId)
            )
          );

        if (allocation) {
          // Update the spent amount
          const newSpentAmount = Number(allocation.spentAmount) + Number(transaction.amount);
          await this.updateBudgetAllocation(allocation.id, {
            spentAmount: String(newSpentAmount)
          });
        }
      }
    }

    return created;
  }

  // Carbon Impact operations
  async getCarbonCategories(): Promise<CarbonCategory[]> {
    return db.select().from(carbonCategories);
  }
  
  async getCarbonCategoryByName(category: string): Promise<CarbonCategory | undefined> {
    const [found] = await db
      .select()
      .from(carbonCategories)
      .where(eq(carbonCategories.category, category));
    return found;
  }
  
  async getUserCarbonPreference(userId: number): Promise<CarbonPreference | undefined> {
    const [preference] = await db
      .select()
      .from(carbonPreferences)
      .where(eq(carbonPreferences.userId, userId));
    return preference;
  }
  
  async createOrUpdateCarbonPreference(userId: number, data: Partial<InsertCarbonPreference>): Promise<CarbonPreference> {
    // Try to find existing preference
    const existingPreference = await this.getUserCarbonPreference(userId);
    
    if (existingPreference) {
      // Update existing preference
      const [updated] = await db
        .update(carbonPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(carbonPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      // Create new preference
      const [created] = await db
        .insert(carbonPreferences)
        .values({ ...data, userId } as InsertCarbonPreference)
        .returning();
      return created;
    }
  }
  
  async recordCarbonImpact(impact: InsertCarbonImpact): Promise<CarbonImpact> {
    const [created] = await db
      .insert(carbonImpacts)
      .values(impact)
      .returning();
    return created;
  }
  
  async getUserCarbonImpacts(userId: number, limit: number = 50): Promise<CarbonImpact[]> {
    return db
      .select()
      .from(carbonImpacts)
      .where(eq(carbonImpacts.userId, userId))
      .orderBy(desc(carbonImpacts.transactionDate))
      .limit(limit);
  }
  
  async recordCarbonOffset(offset: InsertCarbonOffset): Promise<CarbonOffset> {
    const [created] = await db
      .insert(carbonOffsets)
      .values(offset)
      .returning();
    return created;
  }
  
  async getUserCarbonOffsets(userId: number, limit: number = 50): Promise<CarbonOffset[]> {
    return db
      .select()
      .from(carbonOffsets)
      .where(eq(carbonOffsets.userId, userId))
      .orderBy(desc(carbonOffsets.contributionDate))
      .limit(limit);
  }
  
  async getUserCarbonSummary(userId: number, days: number = 30): Promise<{
    totalImpact: number;
    totalOffset: number;
    netImpact: number;
    impactByCategory: Record<string, number>;
    monthlyAverage: number;
  }> {
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all carbon impacts in date range
    const impacts = await db
      .select()
      .from(carbonImpacts)
      .where(
        and(
          eq(carbonImpacts.userId, userId),
          gte(carbonImpacts.transactionDate, startDate)
        )
      );
    
    // Get all carbon offsets in date range
    const offsets = await db
      .select()
      .from(carbonOffsets)
      .where(
        and(
          eq(carbonOffsets.userId, userId),
          gte(carbonOffsets.contributionDate, startDate)
        )
      );
    
    // Calculate totals
    const totalImpact = impacts.reduce((sum, impact) => sum + Number(impact.carbonFootprint), 0);
    const totalOffset = offsets.reduce((sum, offset) => sum + Number(offset.offsetAmount), 0);
    const netImpact = totalImpact - totalOffset;
    
    // Calculate impact by category
    const impactByCategory: Record<string, number> = {};
    impacts.forEach(impact => {
      if (!impactByCategory[impact.category]) {
        impactByCategory[impact.category] = 0;
      }
      impactByCategory[impact.category] += Number(impact.carbonFootprint);
    });
    
    // Calculate monthly average (based on entire history)
    const allImpacts = await db
      .select()
      .from(carbonImpacts)
      .where(eq(carbonImpacts.userId, userId));
    
    let monthlyAverage = 0;
    if (allImpacts.length > 0) {
      const oldestImpact = allImpacts.reduce((oldest, current) => 
        current.transactionDate < oldest.transactionDate ? current : oldest
      );
      
      const oldestDate = new Date(oldestImpact.transactionDate);
      const currentDate = new Date();
      const monthsDiff = (currentDate.getFullYear() - oldestDate.getFullYear()) * 12 + 
                         (currentDate.getMonth() - oldestDate.getMonth());
      
      const totalHistoricalImpact = allImpacts.reduce((sum, impact) => 
        sum + Number(impact.carbonFootprint), 0);
      
      monthlyAverage = monthsDiff > 0 ? totalHistoricalImpact / monthsDiff : totalHistoricalImpact;
    }
    
    return {
      totalImpact,
      totalOffset,
      netImpact,
      impactByCategory,
      monthlyAverage
    };
  }
}

export const storage = new DatabaseStorage();
