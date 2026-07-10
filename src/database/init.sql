-- creating an expense type 
CREATE TYPE expense_category AS ENUM(
  'Groceries', 
  'Leisure', 
  'Electronics', 
  'Utilities', 
  'Clothing', 
  'Health', 
  'Others'
);

-- create user table
CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL, 
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- create expense table
CREATE TABLE IF NOT EXISTS expenses(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    category expense_category  NOT NULL,
    descriptions TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Altering users column to add budget 
ALTER TABLE users ADD COLUMN monthly_budget NUMERIC(10, 2) DEFAULT 1000.00;