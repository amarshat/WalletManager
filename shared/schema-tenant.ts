import { pgTable, text, serial, integer, boolean, json, timestamp, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Tenants Table
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id").notNull().unique(), // Unique identifier for the tenant (slug)
  name: text("name").notNull(), // Display name for the tenant
  tagline: text("tagline"), // Tenant tagline/slogan
  logo: text("logo"), // Logo URL or path
  primaryColor: text("primary_color").default("#4F46E5"), // Primary brand color
  secondaryColor: text("secondary_color").default("#818CF8"), // Secondary brand color
  customCss: text("custom_css"), // Optional custom CSS for tenant branding
  status: text("status").default("ACTIVE"), // ACTIVE, SUSPENDED, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Tenant Relationship
export const userTenants = pgTable("user_tenants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  role: text("role").default("USER").notNull(), // USER, ADMIN, CO-ADMIN
  isDefault: boolean("is_default").default(false), // If user belongs to multiple tenants, which is default
  createdAt: timestamp("created_at").defaultNow(),

  // Enforce unique combination of userId and tenantId
  // A user can only belong to a tenant once
});

// Schema definitions for inserts
export const insertTenantSchema = createInsertSchema(tenants)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertUserTenantSchema = createInsertSchema(userTenants)
  .omit({ id: true, createdAt: true });

// Types for inserts and selects
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

export type InsertUserTenant = z.infer<typeof insertUserTenantSchema>;
export type UserTenant = typeof userTenants.$inferSelect;