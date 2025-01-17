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

--create coffee bean profile
INSERT INTO coffee_beans (name, origin, roast_level, image_url, price_per_kg, stock_quantity, description)
VALUES ('Sunrise Valley', 'Brazil', 'light', 'coffee_pouch2.png', 25, 100, 'A rich blend with hints of caramel and chocolate.');

INSERT INTO coffee_beans (name, origin, roast_level, image_url, price_per_kg, stock_quantity, description)
VALUES ('Moutain Peaks', 'Colombia', 'dark', 'coffee_pouch1.png', 25, 100, 'Smooth, fruity notes of Colombia''s finest coffee.');

INSERT INTO coffee_beans (name, origin, roast_level, image_url, price_per_kg, stock_quantity, description)
VALUES ('Sunset Roast', 'Ethiopia', 'medium', 'coffee_pouch3.png', 25, 100, 'A bold, dark roast with smoky undertones.');

INSERT INTO coffee_beans (name, origin, roast_level, image_url, price_per_kg, stock_quantity, description)
VALUES ('Golden Bean Farm', 'Kenya', 'light', 'coffee_pouch4.png', 25, 100, 'Light roasted with hints of caramel');