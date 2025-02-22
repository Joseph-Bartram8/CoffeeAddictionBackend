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

export const getUserBeansQuery = `-- name: GetUserBeans :many
SELECT bean_id, user_id, name, origin, roast_level, image_url, price_per_kg, stock_quantity, description FROM coffee_beans WHERE user_id = $1`;

export interface GetUserBeansArgs {
    userId: number | null;
}

export interface GetUserBeansRow {
    beanId: number;
    userId: number | null;
    name: string;
    origin: string | null;
    roastLevel: string | null;
    imageUrl: string | null;
    pricePerKg: string | null;
    stockQuantity: number | null;
    description: string | null;
}

export async function getUserBeans(client: Client, args: GetUserBeansArgs): Promise<GetUserBeansRow[]> {
    const result = await client.query({
        text: getUserBeansQuery,
        values: [args.userId],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            beanId: row[0],
            userId: row[1],
            name: row[2],
            origin: row[3],
            roastLevel: row[4],
            imageUrl: row[5],
            pricePerKg: row[6],
            stockQuantity: row[7],
            description: row[8]
        };
    });
}

export const createUserBeanQuery = `-- name: CreateUserBean :one
INSERT INTO coffee_beans (name, origin, roast_level, image_url, price_per_kg, stock_quantity, description, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING bean_id, user_id, name, origin, roast_level, image_url, price_per_kg, stock_quantity, description`;

export interface CreateUserBeanArgs {
    name: string;
    origin: string | null;
    roastLevel: string | null;
    imageUrl: string | null;
    pricePerKg: string | null;
    stockQuantity: number | null;
    description: string | null;
    userId: number | null;
}

export interface CreateUserBeanRow {
    beanId: number;
    userId: number | null;
    name: string;
    origin: string | null;
    roastLevel: string | null;
    imageUrl: string | null;
    pricePerKg: string | null;
    stockQuantity: number | null;
    description: string | null;
}

export async function createUserBean(client: Client, args: CreateUserBeanArgs): Promise<CreateUserBeanRow | null> {
    const result = await client.query({
        text: createUserBeanQuery,
        values: [args.name, args.origin, args.roastLevel, args.imageUrl, args.pricePerKg, args.stockQuantity, args.description, args.userId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        beanId: row[0],
        userId: row[1],
        name: row[2],
        origin: row[3],
        roastLevel: row[4],
        imageUrl: row[5],
        pricePerKg: row[6],
        stockQuantity: row[7],
        description: row[8]
    };
}

export const deleteUserBeanQuery = `-- name: DeleteUserBean :exec
DELETE FROM coffee_beans WHERE bean_id = $1 AND user_id = $2`;

export interface DeleteUserBeanArgs {
    beanId: number;
    userId: number | null;
}

export async function deleteUserBean(client: Client, args: DeleteUserBeanArgs): Promise<void> {
    await client.query({
        text: deleteUserBeanQuery,
        values: [args.beanId, args.userId],
        rowMode: "array"
    });
}

