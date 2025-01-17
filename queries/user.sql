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