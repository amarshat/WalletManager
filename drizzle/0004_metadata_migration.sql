-- Add metadata columns to tables for multi-tenant support

-- Add metadata column to budget_transactions table
ALTER TABLE "budget_transactions" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- Add metadata column to customer_wallets table
ALTER TABLE "customer_wallets" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- Add metadata column to budget_plans for tenant information
ALTER TABLE "budget_plans" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- Add metadata column to budget_categories for tenant information
ALTER TABLE "budget_categories" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- Make existing budget transactions and wallets associate with default tenant
DO $$
DECLARE
  default_tenant_id INTEGER;
BEGIN
  -- Get the default tenant ID (assuming it's the first one created)
  SELECT "id" INTO default_tenant_id FROM "tenants" ORDER BY "id" LIMIT 1;
  
  -- Skip if no tenant found
  IF default_tenant_id IS NOT NULL THEN
    -- Update budget transactions
    UPDATE "budget_transactions" 
    SET "metadata" = jsonb_build_object('tenantId', default_tenant_id)
    WHERE "metadata" IS NULL OR NOT "metadata" ? 'tenantId';
    
    -- Update customer wallets
    UPDATE "customer_wallets" 
    SET "metadata" = jsonb_build_object('tenantId', default_tenant_id)
    WHERE "metadata" IS NULL OR NOT "metadata" ? 'tenantId';
    
    -- Update budget plans
    UPDATE "budget_plans" 
    SET "metadata" = jsonb_build_object('tenantId', default_tenant_id)
    WHERE "metadata" IS NULL OR NOT "metadata" ? 'tenantId';
    
    -- Update budget categories
    UPDATE "budget_categories" 
    SET "metadata" = jsonb_build_object('tenantId', default_tenant_id)
    WHERE "metadata" IS NULL OR NOT "metadata" ? 'tenantId';
  END IF;
END $$;