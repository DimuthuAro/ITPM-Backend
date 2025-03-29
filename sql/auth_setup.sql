-- Update the user table to support authentication
-- If user table already exists, modify it
ALTER TABLE user
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME DEFAULT NULL,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- If user table doesn't exist, create it
CREATE TABLE IF NOT EXISTS user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expires DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create a test user for development (password is 'password123' hashed with bcrypt)
INSERT INTO user (name, email, password, role)
VALUES (
  'Admin User', 
  'admin@example.com', 
  '$2a$12$hZ0azQEZetkB/tEu1RbAEOlPvlIYcmAw1O/0sGBKWW5fZ5SQ2L7/u', 
  'admin'
)
ON DUPLICATE KEY UPDATE name = 'Admin User', role = 'admin';

-- Create a regular test user
INSERT INTO user (name, email, password, role)
VALUES (
  'Test User', 
  'user@example.com', 
  '$2a$12$hZ0azQEZetkB/tEu1RbAEOlPvlIYcmAw1O/0sGBKWW5fZ5SQ2L7/u', 
  'user'
)
ON DUPLICATE KEY UPDATE name = 'Test User', role = 'user'; 