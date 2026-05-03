// Load environment variables from .env file
import "dotenv/config";
import { afterAll, describe, expect, test } from "@jest/globals";

import fs from "node:fs";

import prisma from "../src/lib/prisma";

// Close the database connection after all tests have run
afterAll(async () => {
  await prisma.$disconnect();
});

// Test suite for environment installation
describe("Installation", () => {
  // Test: Check if the .env file exists
  test("You have created /server/.env", async () => {
    expect(fs.existsSync(`${__dirname}/../.env`)).toBe(true);
  });

  // Test: Check if the .env.sample file exists
  test("You have retained /server/.env.sample", async () => {
    expect(fs.existsSync(`${__dirname}/../.env.sample`)).toBe(true);
  });

  // Test: Check if the .env file is properly filled with valid database connection information
  test("You have filled /server/.env with valid information to connect to your database", async () => {
    expect.assertions(0);

    try {
      // Check if the connection is successful
      await prisma.$connect();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  // Test: Check if the database migration scripts have been executed
  test("You have executed the Prisma migration scripts", async () => {
    const rows = await prisma.user.findMany();

    expect(rows.length).toBeGreaterThanOrEqual(0);
  });
});
