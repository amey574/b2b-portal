DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS pricing_tiers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS admins;

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  credit_limit REAL NOT NULL DEFAULT 0.00,
  current_debt REAL NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  base_price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,
  unit_price REAL NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  total_amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Mock Data
DELETE FROM admins;
INSERT INTO admins (email, password) VALUES
('admin@portal.com', 'password123');

DELETE FROM companies;
INSERT INTO companies (id, name, credit_limit, current_debt) VALUES
(1, 'ABC Traders', 10000.00, 3000.00),
(2, 'XYZ Enterprises', 25000.00, 5000.00);

DELETE FROM products;
INSERT INTO products (id, name, base_price) VALUES
(1, 'Industrial Bolts', 60.00),
(2, 'Steel Beams', 150.00);

DELETE FROM pricing_tiers;
INSERT INTO pricing_tiers (product_id, min_quantity, max_quantity, unit_price) VALUES
(1, 1, 9, 60.00),
(1, 10, 99, 50.00),
(1, 100, NULL, 40.00),
(2, 1, 19, 150.00),
(2, 20, 49, 130.00),
(2, 50, NULL, 110.00);
