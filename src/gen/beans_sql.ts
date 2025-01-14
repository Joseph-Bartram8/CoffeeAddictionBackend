import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getBeansQuery = `-- name: GetBeans :many
SELECT bean_id, user_id, name, origin, roast_level, image_url, price_per_kg, stock_quantity, description FROM coffee_beans`;

export interface GetBeansRow {
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

export async function getBeans(client: Client): Promise<GetBeansRow[]> {
    const result = await client.query({
        text: getBeansQuery,
        values: [],
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

export const createBeanQuery = `-- name: CreateBean :one
INSERT INTO coffee_beans (user_id, name, origin, roast_level, price_per_kg, stock_quantity, description) VALUES (1, $1, $2, $3, $4, $5, $6) RETURNING bean_id, user_id, name, origin, roast_level, image_url, price_per_kg, stock_quantity, description`;

export interface CreateBeanArgs {
    name: string;
    origin: string | null;
    roastLevel: string | null;
    pricePerKg: string | null;
    stockQuantity: number | null;
    description: string | null;
}

export interface CreateBeanRow {
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

export async function createBean(client: Client, args: CreateBeanArgs): Promise<CreateBeanRow | null> {
    const result = await client.query({
        text: createBeanQuery,
        values: [args.name, args.origin, args.roastLevel, args.pricePerKg, args.stockQuantity, args.description],
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

