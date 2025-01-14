-- name: GetBeans :many
SELECT * FROM coffee_beans;

-- name: CreateBean :one
INSERT INTO coffee_beans (user_id, name, origin, roast_level, price_per_kg, stock_quantity, description) VALUES (1, $1, $2, $3, $4, $5, $6) RETURNING *;