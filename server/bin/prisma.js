#!/usr/bin/env node

require("dotenv/config");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const args = process.argv.slice(2);
const command = args[0] || "";
const requiresLiveDatabase = new Set(["migrate", "db", "studio"]);

if (!process.env.DATABASE_URL && requiresLiveDatabase.has(command)) {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (DB_HOST && DB_USER && DB_NAME) {
    const password = DB_PASSWORD ? `:${encodeURIComponent(DB_PASSWORD)}` : "";
    const port = DB_PORT || "3306";
    process.env.DATABASE_URL = `mysql://${DB_USER}${password}@${DB_HOST}:${port}/${DB_NAME}`;
  }
}

if (!process.env.DATABASE_URL) {
  if (command === "generate") {
    process.env.DATABASE_URL = "mysql://placeholder:placeholder@localhost:3306/placeholder";
  } else {
    console.error(
      "DATABASE_URL is required. Define DATABASE_URL or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME.",
    );
    process.exit(1);
  }
}

const prismaCliCandidates = [
  path.join(__dirname, "../node_modules/prisma/build/index.js"),
  path.join(__dirname, "../../node_modules/prisma/build/index.js"),
];
const prismaCli = prismaCliCandidates.find((candidate) =>
  fs.existsSync(candidate),
);

if (!prismaCli) {
  console.error("Cannot find Prisma CLI binary in node_modules.");
  process.exit(1);
}

const result = spawnSync("node", [prismaCli, ...args], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
