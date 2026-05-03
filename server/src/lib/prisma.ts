import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (DB_HOST && DB_USER && DB_NAME) {
    const password = DB_PASSWORD ? `:${encodeURIComponent(DB_PASSWORD)}` : "";
    const port = DB_PORT ?? "3306";
    process.env.DATABASE_URL = `mysql://${DB_USER}${password}@${DB_HOST}:${port}/${DB_NAME}`;
  }
}

declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export default prisma;
