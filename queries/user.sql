-- name: GetUserByID :one
SELECT * FROM users WHERE user_id = $1;

-- name: GetUserByUsername :one
SELECT * FROM users WHERE username = $1;

-- name: Signup :one
INSERT INTO users (username, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *;

-- name: ResetLoginAttempts :exec
UPDATE users SET login_attempts = 0 WHERE user_id = $1;

-- name: IncrementLoginAttempts :exec
UPDATE users SET login_attempts = login_attempts + 1 WHERE user_id = $1;

-- name: GetUserBeans :many
SELECT * FROM coffee_beans WHERE user_id = $1;

-- name: CreateUserBean :one
INSERT INTO coffee_beans (name, origin, roast_level, image_url, price_per_kg, stock_quantity, description, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;

-- name: DeleteUserBean :exec
DELETE FROM coffee_beans WHERE bean_id = $1 AND user_id = $2;