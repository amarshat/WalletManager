import { db } from "./db";
import { tenants, userTenants } from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * Seeds the database with initial tenant data
 */
export async function seedTenants() {
  try {
    // Check if tenants already exist
    const existingTenants = await db.select().from(tenants);
    
    if (existingTenants.length === 0) {
      console.log('Seeding initial tenants...');
      
      // Insert sample tenants
      await db.insert(tenants).values([
        {
          tenantId: 'paysage',
          name: 'PaySage Financial',
          tagline: 'Modern Financial Solutions',
          primaryColor: '#4F46E5',
          secondaryColor: '#818CF8',
          logo: '/assets/logos/paysage-logo.svg',
          status: 'active',
        },
        {
          tenantId: 'gamepay',
          name: 'GamePay',
          tagline: 'Game Payments Made Simple',
          primaryColor: '#10B981',
          secondaryColor: '#34D399',
          logo: '/assets/logos/gamepay-logo.svg',
          status: 'active',
        },
        {
          tenantId: 'faithgive',
          name: 'FaithGive',
          tagline: 'Secure Donation Processing',
          primaryColor: '#F59E0B',
          secondaryColor: '#FBBF24',
          logo: '/assets/logos/faithgive-logo.svg',
          status: 'active',
        }
      ]);
      
      console.log('Tenant seeding complete');
    } else {
      console.log(`Tenants already exist (${existingTenants.length} found). Skipping seed.`);
    }
  } catch (error) {
    console.error('Error seeding tenants:', error);
  }
}

/**
 * Associates a user with a tenant
 */
export async function associateUserWithTenant(
  userId: number, 
  tenantId: number, 
  role: string = 'user',
  isDefault: boolean = true
) {
  try {
    // Check if association already exists
    const existingAssociation = await db
      .select()
      .from(userTenants)
      .where(sql`user_id = ${userId} AND tenant_id = ${tenantId}`);
    
    if (existingAssociation.length === 0) {
      // Create the association
      await db.insert(userTenants).values({
        userId,
        tenantId,
        role,
        isDefault
      });
      
      console.log(`User ${userId} associated with tenant ${tenantId}`);
      return true;
    } else {
      console.log(`User ${userId} already associated with tenant ${tenantId}`);
      return false;
    }
  } catch (error) {
    console.error('Error associating user with tenant:', error);
    return false;
  }
}