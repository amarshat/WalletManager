CREATE TABLE IF NOT EXISTS budget_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366F1',
  icon TEXT,
  parent_id INTEGER,
  user_id INTEGER REFERENCES users(id),
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  total_amount DECIMAL(10, 2) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_allocations (
  id SERIAL PRIMARY KEY,
  budget_plan_id INTEGER NOT NULL REFERENCES budget_plans(id),
  category_id INTEGER NOT NULL REFERENCES budget_categories(id),
  allocated_amount DECIMAL(10, 2) NOT NULL,
  spent_amount DECIMAL(10, 2) DEFAULT '0',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  category_id INTEGER NOT NULL REFERENCES budget_categories(id),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  transaction_date TIMESTAMP NOT NULL DEFAULT NOW(),
  wallet_transaction_id TEXT,
  is_income BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

