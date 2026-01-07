import { PrismaClient } from "./generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env file from the database package directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, ".env") });

let connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/bits_de_cipher";

// Ensure SSL mode is set for DigitalOcean connections
if (connectionString.includes("ondigitalocean.com") && !connectionString.includes("sslmode=")) {
    connectionString += (connectionString.includes("?") ? "&" : "?") + "sslmode=require";
}

// Configure SSL for DigitalOcean PostgreSQL
// For self-signed certificates, we need to set rejectUnauthorized to false
const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("ondigitalocean.com") ? {
        rejectUnauthorized: false
    } : undefined
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter: adapter
});

export default prisma;