import { PrismaClient } from "./generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";

import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
const adapter = new PrismaPg({
    connectionString : process.env.DATABASE_URL,
    
});

const prisma = new PrismaClient({
    adapter: adapter
});

export default prisma;