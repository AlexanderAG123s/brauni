-- PostgreSQL Schema for Brauni Library Management System

-- Note: Create the database first manually:
-- CREATE DATABASE brauni_db;

CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  matricula VARCHAR(50) NOT NULL UNIQUE,
  career VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  isbn VARCHAR(50) UNIQUE,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Available',
  cover_color VARCHAR(20) DEFAULT '#3b82f6',
  cover_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  user_id INT,
  book_id INT,
  loan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  return_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'Active',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE INDEX idx_users_search ON users(name, matricula);
CREATE INDEX idx_books_search ON books(title, author);

-- Insert default admin staff member
INSERT INTO staff (name, email, password, role) VALUES
  ('Super Admin', 'superadmin@brauni.edu', '$2b$10$W06.zOkP2IJGtQCtRPohGO/EYsFktib1JTFQPyw..y9C6BjLBwkOC', 'super_admin'),
  ('Brauni', 'admin@brauni.edu', '$2b$10$W06.zOkP2IJGtQCtRPohGO/EYsFktib1JTFQPyw..y9C6BjLBwkOC', 'admin')
ON CONFLICT (email) DO NOTHING;
