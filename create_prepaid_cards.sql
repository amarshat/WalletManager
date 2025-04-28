-- Create prepaid_cards table
CREATE TABLE IF NOT EXISTS prepaid_cards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  card_number TEXT NOT NULL,
  last4 TEXT NOT NULL,
  expiry_month TEXT NOT NULL,
  expiry_year TEXT NOT NULL,
  cardholder_name TEXT NOT NULL,
  card_type TEXT NOT NULL DEFAULT 'MASTERCARD',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);