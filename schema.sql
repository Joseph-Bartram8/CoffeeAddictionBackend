-- Create users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    login_attempts INT NOT NULL DEFAULT 0,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create coffee_beans table
CREATE TABLE coffee_beans (
    bean_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    name VARCHAR(100) NOT NULL,
    origin VARCHAR(100),
    roast_level VARCHAR(50),
    image_url VARCHAR,
    price_per_kg DECIMAL(10, 2),
    stock_quantity INT,
    description TEXT
);

--create example user
INSERT INTO users (username, password_hash, first_name, last_name) VALUES ('john', 'abc', 'John', 'Doe');