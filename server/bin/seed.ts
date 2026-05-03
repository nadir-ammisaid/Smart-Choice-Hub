import "dotenv/config";
import argon2 from "argon2";
import { faker } from "@faker-js/faker";
import prisma from "../src/lib/prisma";

const DEFAULT_USERS = 80;
const DEFAULT_REQUESTS_PER_USER = 4;
const DEFAULT_COMMENTS_PER_REQUEST = 6;

const seedUsers = Number.parseInt(process.env.SEED_USERS ?? "", 10) || DEFAULT_USERS;
const seedRequestsPerUser =
  Number.parseInt(process.env.SEED_REQUESTS_PER_USER ?? "", 10) ||
  DEFAULT_REQUESTS_PER_USER;
const seedCommentsPerRequest =
  Number.parseInt(process.env.SEED_COMMENTS_PER_REQUEST ?? "", 10) ||
  DEFAULT_COMMENTS_PER_REQUEST;

const tags = [
  "Frontend",
  "Backend",
  "Infra",
  "UX",
  "Product",
  "Performance",
  "Security",
  "Data",
  "DevOps",
  "Mobile",
  "Support",
  "Roadmap",
];

const maybeNull = (value: string, chance = 0.35) =>
  Math.random() < chance ? null : value;

const randomTag = () => tags[Math.floor(Math.random() * tags.length)];

const seed = async () => {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "true") {
    console.error(
      "Refused: seeding is disabled in production by default. Set ALLOW_PROD_SEED=true to force it.",
    );
    process.exit(1);
  }

  try {
    faker.seed(42);

    await prisma.role.upsert({
      where: { id: 1 },
      update: { roleName: "admin" },
      create: { id: 1, roleName: "admin" },
    });
    await prisma.role.upsert({
      where: { id: 2 },
      update: { roleName: "visitor" },
      create: { id: 2, roleName: "visitor" },
    });

    const sharedHash = await argon2.hash("Password123!");
    const createdUserIds: number[] = [];

    for (let i = 0; i < seedUsers; i += 1) {
      const firstName = faker.person.firstName().slice(0, 50);
      const lastName = faker.person.lastName().slice(0, 50);
      const email = `seed.user.${Date.now()}.${i}@smartchoicehub.test`.slice(0, 50);
      const avatar =
        i % 4 === 0
          ? `uploads/seed-avatar-${(i % 12) + 1}.jpg`
          : null;

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          birthday: faker.date.birthdate({ min: 18, max: 65, mode: "age" }),
          avatar,
          hashedPassword: sharedHash,
          roleId: i % 25 === 0 ? 1 : 2,
        },
        select: { id: true },
      });

      createdUserIds.push(user.id);
    }

    const existingUserIds = (
      await prisma.user.findMany({
        select: { id: true },
      })
    ).map((user) => user.id);

    const requestIds: number[] = [];
    for (const userId of createdUserIds) {
      for (let i = 0; i < seedRequestsPerUser; i += 1) {
        const title = faker.lorem.words({ min: 2, max: 5 }).slice(0, 50);
        const details1 = faker.lorem.paragraph({ min: 2, max: 4 });
        const details2 = maybeNull(faker.lorem.paragraph({ min: 1, max: 2 }));
        const details3 = maybeNull(faker.lorem.sentences({ min: 1, max: 2 }), 0.5);

        const request = await prisma.request.create({
          data: {
            title,
            tag1: randomTag().slice(0, 50),
            tag2: maybeNull(randomTag().slice(0, 50), 0.4),
            details1,
            details2,
            details3,
            date: faker.date.between({
              from: "2023-01-01T00:00:00.000Z",
              to: new Date(),
            }),
            userId,
          },
          select: { id: true },
        });

        requestIds.push(request.id);
      }
    }

    const commentPayload: Array<{
      details: string;
      userId: number;
      requestId: number;
      date: Date;
    }> = [];

    for (const requestId of requestIds) {
      const amount = faker.number.int({
        min: Math.max(2, seedCommentsPerRequest - 2),
        max: seedCommentsPerRequest + 3,
      });

      for (let i = 0; i < amount; i += 1) {
        commentPayload.push({
          details: faker.lorem.sentences({ min: 1, max: 3 }),
          userId: existingUserIds[Math.floor(Math.random() * existingUserIds.length)],
          requestId,
          date: faker.date.recent({ days: 180 }),
        });
      }
    }

    for (let i = 0; i < commentPayload.length; i += 500) {
      await prisma.comment.createMany({
        data: commentPayload.slice(i, i + 500),
      });
    }

    console.info(
      `Seed complete: +${createdUserIds.length} users, +${requestIds.length} requests, +${commentPayload.length} comments`,
    );
    console.info("Shared test password for seeded users: Password123!");
  } catch (error) {
    const err = error as Error;
    console.error("Seed failed:", err.message);
    console.error(err.stack);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

void seed();
