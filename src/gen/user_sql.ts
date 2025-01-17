import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getUserByIDQuery = `-- name: GetUserByID :one
SELECT user_id, username, password_hash, login_attempts, first_name, last_name, created_at FROM users WHERE user_id = $1`;

export interface GetUserByIDArgs {
    userId: number;
}

export interface GetUserByIDRow {
    userId: number;
    username: string;
    passwordHash: string;
    loginAttempts: number;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date | null;
}

export async function getUserByID(client: Client, args: GetUserByIDArgs): Promise<GetUserByIDRow | null> {
    const result = await client.query({
        text: getUserByIDQuery,
        values: [args.userId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        userId: row[0],
        username: row[1],
        passwordHash: row[2],
        loginAttempts: row[3],
        firstName: row[4],
        lastName: row[5],
        createdAt: row[6]
    };
}

export const getUserByUsernameQuery = `-- name: GetUserByUsername :one
SELECT user_id, username, password_hash, login_attempts, first_name, last_name, created_at FROM users WHERE username = $1`;

export interface GetUserByUsernameArgs {
    username: string;
}

export interface GetUserByUsernameRow {
    userId: number;
    username: string;
    passwordHash: string;
    loginAttempts: number;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date | null;
}

export async function getUserByUsername(client: Client, args: GetUserByUsernameArgs): Promise<GetUserByUsernameRow | null> {
    const result = await client.query({
        text: getUserByUsernameQuery,
        values: [args.username],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        userId: row[0],
        username: row[1],
        passwordHash: row[2],
        loginAttempts: row[3],
        firstName: row[4],
        lastName: row[5],
        createdAt: row[6]
    };
}

export const signupQuery = `-- name: Signup :one
INSERT INTO users (username, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING user_id, username, password_hash, login_attempts, first_name, last_name, created_at`;

export interface SignupArgs {
    username: string;
    passwordHash: string;
    firstName: string | null;
    lastName: string | null;
}

export interface SignupRow {
    userId: number;
    username: string;
    passwordHash: string;
    loginAttempts: number;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date | null;
}

export async function signup(client: Client, args: SignupArgs): Promise<SignupRow | null> {
    const result = await client.query({
        text: signupQuery,
        values: [args.username, args.passwordHash, args.firstName, args.lastName],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        userId: row[0],
        username: row[1],
        passwordHash: row[2],
        loginAttempts: row[3],
        firstName: row[4],
        lastName: row[5],
        createdAt: row[6]
    };
}

export const resetLoginAttemptsQuery = `-- name: ResetLoginAttempts :exec
UPDATE users SET login_attempts = 0 WHERE user_id = $1`;

export interface ResetLoginAttemptsArgs {
    userId: number;
}

export async function resetLoginAttempts(client: Client, args: ResetLoginAttemptsArgs): Promise<void> {
    await client.query({
        text: resetLoginAttemptsQuery,
        values: [args.userId],
        rowMode: "array"
    });
}

export const incrementLoginAttemptsQuery = `-- name: IncrementLoginAttempts :exec
UPDATE users SET login_attempts = login_attempts + 1 WHERE user_id = $1`;

export interface IncrementLoginAttemptsArgs {
    userId: number;
}

export async function incrementLoginAttempts(client: Client, args: IncrementLoginAttemptsArgs): Promise<void> {
    await client.query({
        text: incrementLoginAttemptsQuery,
        values: [args.userId],
        rowMode: "array"
    });
}

