DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS pricing_tiers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS admins;

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  credit_limit REAL NOT NULL DEFAULT 0.00,
  current_debt REAL NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  base_price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  product_id INTEGER NOT NULL,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,
  unit_price REAL NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
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
(1, 'Industrial Bolts (per box)', 450.00),
(2, 'Steel Beams (per ton)', 45000.00),
(3, 'Copper Wiring (per meter)', 400.00),
(4, 'Cement Bags (50kg)', 380.00),
(5, 'PVC Pipes (per unit)', 120.00);

DELETE FROM pricing_tiers;
INSERT INTO pricing_tiers (product_id, min_quantity, max_quantity, unit_price) VALUES
(1, 1, 9, 450.00),
(1, 10, 99, 420.00),
(1, 100, NULL, 380.00),
(2, 1, 4, 45000.00),
(2, 5, 19, 43000.00),
(2, 20, NULL, 40000.00),
(3, 1, 49, 400.00),
(3, 50, 199, 380.00),
(3, 200, NULL, 350.00),
(4, 1, 49, 380.00),
(4, 50, 199, 360.00),
(4, 200, NULL, 340.00),
(5, 1, 99, 120.00),
(5, 100, 499, 105.00),
(5, 500, NULL, 90.00);
