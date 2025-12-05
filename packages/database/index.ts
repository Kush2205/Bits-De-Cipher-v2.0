import { PrismaClient } from "./generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString : process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/bits_de_cipher"
})

const prisma = new PrismaClient({
    adapter: adapter
});

export default prisma;