-- Add tenants table
CREATE TABLE IF NOT EXISTS "tenants" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "tagline" TEXT,
  "logo" TEXT,
  "primary_color" TEXT DEFAULT '#4F46E5',
  "secondary_color" TEXT DEFAULT '#818CF8',
  "custom_css" TEXT,
  "status" TEXT DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Add user_tenants table for user/tenant relationships
CREATE TABLE IF NOT EXISTS "user_tenants" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "tenant_id" INTEGER NOT NULL REFERENCES "tenants"("id"),
  "role" TEXT NOT NULL DEFAULT 'USER',
  "is_default" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  UNIQUE("user_id", "tenant_id")
);

-- Create superadmin user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "users" WHERE "username" = 'superadmin') THEN
    INSERT INTO "users" ("username", "password", "full_name", "is_admin")
    VALUES (
      'superadmin',
      -- Password: SuperPasswordAdminHero
      '$2b$10$M6J6tACvS9gZ3A8TJb6eZOSzYVUW.rYfhFfDH0Z3YQYIqEw7eO3zK',
      'Super Administrator',
      TRUE
    );
  END IF;
END $$;

-- Create default Paysafe tenant if not exists
DO $$
DECLARE
  tenant_id INTEGER;
  superadmin_id INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "tenants" WHERE "tenant_id" = 'paysafe') THEN
    INSERT INTO "tenants" ("tenant_id", "name", "tagline", "logo", "primary_color", "secondary_color")
    VALUES (
      'paysafe',
      'PaySage Wallet',
      'Your Digital Wallet Solution',
      NULL,
      '#4F46E5',
      '#818CF8'
    )
    RETURNING "id" INTO tenant_id;

    -- Get superadmin ID
    SELECT "id" INTO superadmin_id FROM "users" WHERE "username" = 'superadmin';

    -- Add superadmin to tenant with role "SUPERADMIN"
    INSERT INTO "user_tenants" ("user_id", "tenant_id", "role", "is_default")
    VALUES (superadmin_id, tenant_id, 'SUPERADMIN', TRUE);

    -- Migrate existing users to the default tenant
    INSERT INTO "user_tenants" ("user_id", "tenant_id", "role", "is_default")
    SELECT "id", tenant_id, CASE WHEN "is_admin" THEN 'ADMIN' ELSE 'USER' END, TRUE
    FROM "users"
    WHERE "username" != 'superadmin'; -- Exclude superadmin as they've already been added
  END IF;
END $$;