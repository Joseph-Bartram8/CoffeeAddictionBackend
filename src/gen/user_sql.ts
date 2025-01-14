import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getUserByIDQuery = `-- name: GetUserByID :one
SELECT user_id, username, password_hash, email, first_name, last_name, created_at FROM users WHERE user_id = $1`;

export interface GetUserByIDArgs {
    userId: number;
}

export interface GetUserByIDRow {
    userId: number;
    username: string;
    passwordHash: string;
    email: string;
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
        email: row[3],
        firstName: row[4],
        lastName: row[5],
        createdAt: row[6]
    };
}

