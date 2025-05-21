-- Updating brand_settings table to support multi-tenancy
ALTER TABLE "brand_settings" ADD COLUMN IF NOT EXISTS "tenant_id" INTEGER REFERENCES "tenants"("id");
ALTER TABLE "brand_settings" ADD COLUMN IF NOT EXISTS "is_default" BOOLEAN DEFAULT FALSE;

-- Set first existing brand settings as default if exists
UPDATE "brand_settings" SET "is_default" = TRUE WHERE "id" = (SELECT MIN("id") FROM "brand_settings");