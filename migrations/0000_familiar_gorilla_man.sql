CREATE TABLE "brand_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'PaySage Wallet' NOT NULL,
	"tagline" text DEFAULT 'Your Digital Wallet Solution',
	"logo" text,
	"icon_url" text,
	"primary_color" text DEFAULT '#4F46E5',
	"secondary_color" text DEFAULT '#7E57C2',
	"wallet_auth_key" text,
	"global_brand_name" text DEFAULT 'PaySage AI',
	"global_brand_color" text DEFAULT '#7C3AED',
	"global_brand_position" text DEFAULT 'footer',
	"global_brand_logo" text,
	"wallet_config" json,
	"tenant_id" integer,
	"is_default" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budget_allocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"budget_plan_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"allocated_amount" numeric(10, 2) NOT NULL,
	"spent_amount" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budget_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#6366F1' NOT NULL,
	"icon" text,
	"parent_id" integer,
	"user_id" integer,
	"is_system" boolean DEFAULT false,
	"metadata" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budget_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"metadata" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budget_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"transaction_date" timestamp DEFAULT now() NOT NULL,
	"wallet_transaction_id" text,
	"is_income" boolean DEFAULT false,
	"metadata" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carbon_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"average_carbon_per_dollar" numeric(10, 6) NOT NULL,
	"description" text,
	"icon" text,
	"tips" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "carbon_categories_category_unique" UNIQUE("category")
);
--> statement-breakpoint
CREATE TABLE "carbon_impacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"transaction_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"category" text NOT NULL,
	"carbon_footprint" numeric(10, 4) NOT NULL,
	"carbon_savings" numeric(10, 4) DEFAULT '0',
	"suggestion_applied" boolean DEFAULT false,
	"transaction_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carbon_offsets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"offset_amount" numeric(10, 4) NOT NULL,
	"project_name" text NOT NULL,
	"project_description" text,
	"contribution_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carbon_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tracking_enabled" boolean DEFAULT true,
	"show_suggestions" boolean DEFAULT true,
	"monthly_offset_target" numeric(10, 2),
	"preferred_categories" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "carbon_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"card_type" text NOT NULL,
	"last4" text NOT NULL,
	"expiry_month" text NOT NULL,
	"expiry_year" text NOT NULL,
	"cardholder_name" text,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"customer_id" text NOT NULL,
	"external_reference" text,
	"status" text DEFAULT 'ACTIVE',
	"metadata" json,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "customer_wallets_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE "phantom_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"phantom_wallet_id" integer NOT NULL,
	"account_id" text NOT NULL,
	"currency_code" text NOT NULL,
	"balance" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "phantom_accounts_account_id_unique" UNIQUE("account_id")
);
--> statement-breakpoint
CREATE TABLE "phantom_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" text NOT NULL,
	"source_account_id" integer,
	"destination_account_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"currency_code" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'COMPLETED',
	"note" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "phantom_transactions_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "phantom_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"wallet_id" text NOT NULL,
	"status" text DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "phantom_wallets_wallet_id_unique" UNIQUE("wallet_id")
);
--> statement-breakpoint
CREATE TABLE "prepaid_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"card_number" text NOT NULL,
	"last4" text NOT NULL,
	"expiry_month" text NOT NULL,
	"expiry_year" text NOT NULL,
	"cardholder_name" text NOT NULL,
	"card_type" text DEFAULT 'MASTERCARD' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" text NOT NULL,
	"status_code" integer,
	"request_data" json,
	"response_data" json,
	"details" json,
	"source" text,
	"component" text,
	"level" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"country" text,
	"profile_photo" text,
	"default_currency" text DEFAULT 'USD',
	"is_admin" boolean DEFAULT false,
	"is_phantom_user" boolean DEFAULT false,
	"phantom_user_id" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "wallet_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_id" integer NOT NULL,
	"account_id" text NOT NULL,
	"currency_code" text NOT NULL,
	"external_id" text,
	"has_virtual_instrument" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text,
	"logo" text,
	"primary_color" text DEFAULT '#4F46E5',
	"secondary_color" text DEFAULT '#818CF8',
	"custom_css" text,
	"status" text DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tenants_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "user_tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"role" text DEFAULT 'USER' NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_budget_plan_id_budget_plans_id_fk" FOREIGN KEY ("budget_plan_id") REFERENCES "public"."budget_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_category_id_budget_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."budget_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_plans" ADD CONSTRAINT "budget_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_transactions" ADD CONSTRAINT "budget_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_transactions" ADD CONSTRAINT "budget_transactions_category_id_budget_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."budget_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_impacts" ADD CONSTRAINT "carbon_impacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_offsets" ADD CONSTRAINT "carbon_offsets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_preferences" ADD CONSTRAINT "carbon_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_wallets" ADD CONSTRAINT "customer_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phantom_accounts" ADD CONSTRAINT "phantom_accounts_phantom_wallet_id_phantom_wallets_id_fk" FOREIGN KEY ("phantom_wallet_id") REFERENCES "public"."phantom_wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phantom_transactions" ADD CONSTRAINT "phantom_transactions_source_account_id_phantom_accounts_id_fk" FOREIGN KEY ("source_account_id") REFERENCES "public"."phantom_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phantom_transactions" ADD CONSTRAINT "phantom_transactions_destination_account_id_phantom_accounts_id_fk" FOREIGN KEY ("destination_account_id") REFERENCES "public"."phantom_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phantom_wallets" ADD CONSTRAINT "phantom_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prepaid_cards" ADD CONSTRAINT "prepaid_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_accounts" ADD CONSTRAINT "wallet_accounts_wallet_id_customer_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."customer_wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;