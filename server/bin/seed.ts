import "dotenv/config";
import argon2 from "argon2";
import { faker } from "@faker-js/faker";
import prisma from "../src/lib/prisma";

const DEFAULT_USERS = 18;
const DEFAULT_REQUESTS_TOTAL = 22;
const DEFAULT_MIN_COMMENTS_PER_REQUEST = 0;
const DEFAULT_MAX_COMMENTS_PER_REQUEST = 10;

const seedUsers =
  Number.parseInt(process.env.SEED_USERS ?? "", 10) || DEFAULT_USERS;

const seedRequestsTotal = Math.min(
  Number.parseInt(process.env.SEED_REQUESTS_TOTAL ?? "", 10) ||
    DEFAULT_REQUESTS_TOTAL,
  22,
);

const seedMinCommentsPerRequest =
  Number.parseInt(process.env.SEED_MIN_COMMENTS_PER_REQUEST ?? "", 10) ||
  DEFAULT_MIN_COMMENTS_PER_REQUEST;

const seedMaxCommentsPerRequest = Math.min(
  Number.parseInt(process.env.SEED_MAX_COMMENTS_PER_REQUEST ?? "", 10) ||
    DEFAULT_MAX_COMMENTS_PER_REQUEST,
  10,
);

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
  "Accessibility",
  "Database",
  "Testing",
  "SEO",
];

const requestTemplates = [
  {
    title: "Improve mobile navigation",
    tag1: "Mobile",
    tag2: "UX",
    details1:
      "The navigation menu is difficult to use on small screens. Users have to tap several times before reaching the most important pages.",
    details2:
      "A clearer mobile menu with fewer nested options would improve the overall experience.",
    details3:
      "The priority should be the home page, profile page, request creation page, and logout action.",
    comments: [
      "A sticky bottom navigation could work well for mobile users.",
      "The burger menu should also close automatically after a link is selected.",
      "Make sure the tap targets are large enough for accessibility.",
      "The current menu feels usable, but it could be much faster to navigate.",
    ],
  },
  {
    title: "Add dark mode support",
    tag1: "Frontend",
    tag2: "UX",
    details1:
      "Several users prefer using the application in low-light environments. A dark mode would make the interface more comfortable.",
    details2:
      "The theme should be saved so users do not have to select it every time.",
    details3:
      "The implementation should avoid hardcoded colors and use CSS variables where possible.",
    comments: [
      "CSS variables would make this easier to maintain.",
      "The default theme should probably follow the system preference.",
      "Remember to check contrast ratios for readability.",
      "A toggle in the navbar would be simple and visible.",
    ],
  },
  {
    title: "Optimize image loading",
    tag1: "Performance",
    tag2: "Frontend",
    details1:
      "Some pages load slowly because images are too large. This affects users on mobile networks.",
    details2:
      "Images should be compressed and lazy-loaded when they are not immediately visible.",
    details3:
      "The avatar and logo files should also be checked for unnecessary size.",
    comments: [
      "Lazy loading is a quick win here.",
      "We should use optimized formats like WebP where possible.",
      "The logo is loaded on many pages, so it is worth optimizing first.",
      "A Lighthouse report would help prioritize the biggest assets.",
    ],
  },
  {
    title: "Create better error messages",
    tag1: "Product",
    tag2: "Support",
    details1:
      "When an API call fails, the user often sees a generic error message. This makes it hard to understand what went wrong.",
    details2:
      "The application should explain whether the issue is validation, authentication, server error, or network failure.",
    details3:
      "Errors should remain short, clear, and user-friendly.",
    comments: [
      "Backend errors should return consistent JSON responses.",
      "Frontend alerts should probably be replaced with inline messages.",
      "Validation errors should appear next to the related field.",
      "This will make support much easier.",
    ],
  },
  {
    title: "Improve signup validation",
    tag1: "Frontend",
    tag2: "Security",
    details1:
      "The signup form already checks several fields, but the validation should be consistent between frontend and backend.",
    details2:
      "Invalid email addresses, weak passwords, and duplicate accounts should return clear feedback.",
    details3:
      "The backend should never rely only on frontend validation.",
    comments: [
      "Duplicate email handling is important.",
      "The password rules should be displayed before submission.",
      "Backend validation should mirror the frontend rules.",
      "We should avoid exposing too much information in auth errors.",
    ],
  },
  {
    title: "Add request categories",
    tag1: "Product",
    tag2: "Data",
    details1:
      "Requests would be easier to browse if they were grouped by categories such as frontend, backend, design, database, and security.",
    details2:
      "Categories should be searchable and displayed clearly on request cards.",
    details3:
      "This could later support filtering and analytics.",
    comments: [
      "Tags are useful, but categories would provide more structure.",
      "A request should probably have one main category and optional tags.",
      "Filtering by category would improve discovery.",
      "Keep the category list small at first.",
    ],
  },
  {
    title: "Add pagination to requests",
    tag1: "Backend",
    tag2: "Performance",
    details1:
      "The request list could become slow if all records are loaded at once. Pagination would make the API more scalable.",
    details2:
      "The backend should support limit and offset or cursor-based pagination.",
    details3:
      "The frontend should show a simple next and previous navigation first.",
    comments: [
      "Limit and offset is enough for the first version.",
      "Cursor pagination can come later if the dataset grows.",
      "The API response should include total count if possible.",
      "This will also reduce database load.",
    ],
  },
  {
    title: "Improve profile avatar upload",
    tag1: "Frontend",
    tag2: "Backend",
    details1:
      "Uploading an avatar works, but the user experience could be improved with preview, file size validation, and clearer feedback.",
    details2:
      "Only image files should be accepted, and large files should be rejected before upload.",
    details3:
      "The uploaded avatar should update immediately after success.",
    comments: [
      "A preview before upload would be very helpful.",
      "The backend should validate MIME type and file size.",
      "We should handle upload failures gracefully.",
      "Refreshing the profile after upload is a simple solution.",
    ],
  },
  {
    title: "Protect private routes",
    tag1: "Security",
    tag2: "Frontend",
    details1:
      "Some pages should only be visible to authenticated users. The frontend should redirect visitors to the login page when needed.",
    details2:
      "The backend must still enforce authorization because frontend checks can be bypassed.",
    details3:
      "The user should not briefly see protected content before being redirected.",
    comments: [
      "Private route components would make this cleaner.",
      "The /api/me endpoint can be used to check the session.",
      "The loading state should be handled to avoid flickering.",
      "Backend protection is the most important part.",
    ],
  },
  {
    title: "Add automated API tests",
    tag1: "Testing",
    tag2: "Backend",
    details1:
      "The backend would benefit from automated tests for authentication, users, requests, and comments.",
    details2:
      "Tests should cover success cases, validation failures, and unauthorized access.",
    details3:
      "A small reliable test suite would prevent regressions during deployment.",
    comments: [
      "Start with auth and user creation tests.",
      "Use a separate test database if possible.",
      "Mocking the database could work for unit tests.",
      "Integration tests would catch route issues.",
    ],
  },
  {
    title: "Improve database indexes",
    tag1: "Database",
    tag2: "Performance",
    details1:
      "Queries on users, requests, and comments may become slower as the database grows.",
    details2:
      "Indexes should be reviewed for common lookups such as email, userId, requestId, and creation date.",
    details3:
      "The goal is to speed up reads without adding unnecessary write overhead.",
    comments: [
      "The email column should definitely be indexed or unique.",
      "requestId on comments is probably a high-value index.",
      "We should inspect the most common queries first.",
      "Indexes should be added through Prisma migrations.",
    ],
  },
  {
    title: "Add request search",
    tag1: "Frontend",
    tag2: "Backend",
    details1:
      "Users need a quick way to search existing requests by title, tags, and content.",
    details2:
      "A basic search input should filter results through the backend API.",
    details3:
      "Search should be case-insensitive and return relevant results quickly.",
    comments: [
      "Searching title and tags first would already help.",
      "Debouncing the input will avoid too many API calls.",
      "The API should probably accept a query parameter.",
      "Full-text search can be added later.",
    ],
  },
  {
    title: "Improve accessibility",
    tag1: "Accessibility",
    tag2: "UX",
    details1:
      "The app should be easier to use with keyboard navigation and screen readers.",
    details2:
      "Forms, buttons, links, and navigation menus should have clear accessible labels.",
    details3:
      "Color contrast should be checked across the main pages.",
    comments: [
      "Keyboard navigation should be tested on the navbar first.",
      "Form errors should be announced clearly.",
      "Alt text should describe meaningful images.",
      "This is easier to improve gradually page by page.",
    ],
  },
  {
    title: "Add admin moderation tools",
    tag1: "Product",
    tag2: "Security",
    details1:
      "Admins should be able to moderate inappropriate requests and comments.",
    details2:
      "A first version could allow admins to hide content, delete spam, and review reported posts.",
    details3:
      "Actions should be logged so moderation remains traceable.",
    comments: [
      "Admin permissions should be checked on the backend.",
      "Soft delete might be safer than permanent delete.",
      "Reports could be added in a second phase.",
      "The admin interface should stay simple.",
    ],
  },
  {
    title: "Improve deployment documentation",
    tag1: "DevOps",
    tag2: "Documentation",
    details1:
      "Deployment requires several environment variables across Railway and Vercel. The setup should be documented clearly.",
    details2:
      "The documentation should explain backend variables, frontend variables, database migration, and seed commands.",
    details3:
      "This will make future maintenance safer and faster.",
    comments: [
      "A checklist would be useful.",
      "Documenting CORS and cookies is important.",
      "The Prisma migration workflow should be clearly separated from seeding.",
      "Add examples for Railway and Vercel variables.",
    ],
  },
  {
    title: "Add notification preferences",
    tag1: "Product",
    tag2: "UX",
    details1:
      "Users should be able to choose what kind of notifications they want to receive.",
    details2:
      "A first version could include comments on their requests and updates to followed discussions.",
    details3:
      "Preferences should be stored per user.",
    comments: [
      "Email notifications can come later.",
      "In-app notifications would be enough for the first version.",
      "Users should be able to disable noisy updates.",
      "This feature needs a clear data model.",
    ],
  },
  {
    title: "Improve request creation form",
    tag1: "Frontend",
    tag2: "UX",
    details1:
      "The request creation form should guide users to write clear and useful requests.",
    details2:
      "Helpful placeholders, required fields, and validation messages would improve the quality of submissions.",
    details3:
      "Tags should be easy to select without typing everything manually.",
    comments: [
      "Suggested tags would make the form faster.",
      "The details fields should explain what information is expected.",
      "Validation should happen before submitting.",
      "A draft-saving feature could be useful later.",
    ],
  },
  {
    title: "Add loading states",
    tag1: "Frontend",
    tag2: "UX",
    details1:
      "Several pages currently feel frozen while API requests are loading.",
    details2:
      "Buttons, lists, and forms should show clear loading states when waiting for the backend.",
    details3:
      "This will make the app feel more responsive even on slow networks.",
    comments: [
      "Disable submit buttons during requests to avoid duplicate actions.",
      "Skeleton states could work well for lists.",
      "A simple spinner is enough for the first version.",
      "Loading and error states should be designed together.",
    ],
  },
  {
    title: "Improve API response format",
    tag1: "Backend",
    tag2: "Product",
    details1:
      "API responses should use a consistent format across all routes.",
    details2:
      "Successful responses, validation errors, authentication errors, and server errors should be predictable.",
    details3:
      "This will make frontend code easier to maintain.",
    comments: [
      "A shared error helper would be useful.",
      "Status codes should be reviewed route by route.",
      "The frontend should not need to guess the error shape.",
      "Consistent responses help debugging a lot.",
    ],
  },
  {
    title: "Add SEO metadata",
    tag1: "SEO",
    tag2: "Frontend",
    details1:
      "The app should define useful metadata for public pages such as title, description, and social preview information.",
    details2:
      "This is especially important for pages that may be shared externally.",
    details3:
      "A first version can focus on the homepage and signup page.",
    comments: [
      "React Helmet or static metadata could work depending on the setup.",
      "The homepage needs a clear description.",
      "Open Graph tags would improve social sharing.",
      "SEO is less urgent for authenticated pages.",
    ],
  },
  {
    title: "Add rate limiting",
    tag1: "Security",
    tag2: "Backend",
    details1:
      "Authentication and write endpoints should be protected against abuse.",
    details2:
      "Login, signup, comment creation, and request creation should have basic rate limits.",
    details3:
      "The limits should be strict enough to reduce abuse without blocking normal users.",
    comments: [
      "Login should have the strictest limit.",
      "Rate limiting should happen before expensive operations.",
      "Use IP-based limits for the first version.",
      "Make sure errors are user-friendly.",
    ],
  },
  {
    title: "Improve production logging",
    tag1: "DevOps",
    tag2: "Backend",
    details1:
      "Production logs should make it easier to understand API failures without exposing sensitive data.",
    details2:
      "Logs should include method, path, status, and useful error context.",
    details3:
      "Secrets, passwords, tokens, and personal data should never be logged.",
    comments: [
      "Structured logs would be easier to filter.",
      "Request IDs could help trace errors.",
      "Avoid logging full request bodies.",
      "Railway logs are enough for the first version.",
    ],
  },
];

const maybeNull = (value: string | null, chance = 0.35) =>
  Math.random() < chance ? null : value;

const randomItem = <T>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const seed = async () => {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_PROD_SEED !== "true"
  ) {
    console.error(
      "Refused: seeding is disabled in production by default. Set ALLOW_PROD_SEED=true to force it.",
    );
    process.exit(1);
  }

  try {
    faker.seed(42);

    if (
      process.env.NODE_ENV === "production" &&
      process.env.CLEAR_BEFORE_SEED === "true" &&
      process.env.ALLOW_PROD_RESET !== "true"
    ) {
      console.error(
        "Refused: clearing production data requires ALLOW_PROD_RESET=true.",
      );
      process.exit(1);
    }

    if (process.env.CLEAR_BEFORE_SEED === "true") {
      console.info("Clearing existing database data before seed...");

      await prisma.comment.deleteMany();
      await prisma.request.deleteMany();
      await prisma.user.deleteMany();
      await prisma.role.deleteMany();

      console.info("Database data cleared.");
    }

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
      const email = `seed.user.${Date.now()}.${i}@smartchoicehub.test`.slice(
        0,
        50,
      );
      const avatar = i % 4 === 0 ? `uploads/seed-avatar-${(i % 12) + 1}.jpg` : null;

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

    if (existingUserIds.length === 0) {
      throw new Error("Cannot seed requests: no users available.");
    }

    const requestCount = clamp(seedRequestsTotal, 3, 22);
    const selectedTemplates = faker.helpers.arrayElements(
      requestTemplates,
      requestCount,
    );

    const requestIds: Array<{
      id: number;
      comments: string[];
    }> = [];

    for (let i = 0; i < selectedTemplates.length; i += 1) {
      const template = selectedTemplates[i];
      const userId = randomItem(createdUserIds.length > 0 ? createdUserIds : existingUserIds);

      const request = await prisma.request.create({
        data: {
          title: template.title.slice(0, 50),
          tag1: template.tag1.slice(0, 50),
          tag2: maybeNull(template.tag2.slice(0, 50), 0.2),
          details1: template.details1,
          details2: maybeNull(template.details2, 0.25),
          details3: maybeNull(template.details3, 0.45),
          date: faker.date.between({
            from: "2023-01-01T00:00:00.000Z",
            to: new Date(),
          }),
          userId,
        },
        select: { id: true },
      });

      requestIds.push({
        id: request.id,
        comments: template.comments,
      });
    }

    const commentPayload: Array<{
      details: string;
      userId: number;
      requestId: number;
      date: Date;
    }> = [];

    for (const request of requestIds) {
      const amount = faker.number.int({
        min: seedMinCommentsPerRequest,
        max: seedMaxCommentsPerRequest,
      });

      const selectedComments = faker.helpers.arrayElements(
        request.comments,
        Math.min(amount, request.comments.length),
      );

      for (const comment of selectedComments) {
        commentPayload.push({
          details: comment,
          userId: randomItem(existingUserIds),
          requestId: request.id,
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


// import "dotenv/config";
// import argon2 from "argon2";
// import { faker } from "@faker-js/faker";
// import prisma from "../src/lib/prisma";

// const DEFAULT_USERS = 80;
// const DEFAULT_REQUESTS_PER_USER = 4;
// const DEFAULT_COMMENTS_PER_REQUEST = 6;

// const seedUsers = Number.parseInt(process.env.SEED_USERS ?? "", 10) || DEFAULT_USERS;
// const seedRequestsPerUser =
//   Number.parseInt(process.env.SEED_REQUESTS_PER_USER ?? "", 10) ||
//   DEFAULT_REQUESTS_PER_USER;
// const seedCommentsPerRequest =
//   Number.parseInt(process.env.SEED_COMMENTS_PER_REQUEST ?? "", 10) ||
//   DEFAULT_COMMENTS_PER_REQUEST;

// const tags = [
//   "Frontend",
//   "Backend",
//   "Infra",
//   "UX",
//   "Product",
//   "Performance",
//   "Security",
//   "Data",
//   "DevOps",
//   "Mobile",
//   "Support",
//   "Roadmap",
// ];

// const maybeNull = (value: string, chance = 0.35) =>
//   Math.random() < chance ? null : value;

// const randomTag = () => tags[Math.floor(Math.random() * tags.length)];

// const seed = async () => {
//   if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "true") {
//     console.error(
//       "Refused: seeding is disabled in production by default. Set ALLOW_PROD_SEED=true to force it.",
//     );
//     process.exit(1);
//   }

//   try {
//     faker.seed(42);

//     await prisma.role.upsert({
//       where: { id: 1 },
//       update: { roleName: "admin" },
//       create: { id: 1, roleName: "admin" },
//     });
//     await prisma.role.upsert({
//       where: { id: 2 },
//       update: { roleName: "visitor" },
//       create: { id: 2, roleName: "visitor" },
//     });

//     const sharedHash = await argon2.hash("Password123!");
//     const createdUserIds: number[] = [];

//     for (let i = 0; i < seedUsers; i += 1) {
//       const firstName = faker.person.firstName().slice(0, 50);
//       const lastName = faker.person.lastName().slice(0, 50);
//       const email = `seed.user.${Date.now()}.${i}@smartchoicehub.test`.slice(0, 50);
//       const avatar =
//         i % 4 === 0
//           ? `uploads/seed-avatar-${(i % 12) + 1}.jpg`
//           : null;

//       const user = await prisma.user.create({
//         data: {
//           firstName,
//           lastName,
//           email,
//           birthday: faker.date.birthdate({ min: 18, max: 65, mode: "age" }),
//           avatar,
//           hashedPassword: sharedHash,
//           roleId: i % 25 === 0 ? 1 : 2,
//         },
//         select: { id: true },
//       });

//       createdUserIds.push(user.id);
//     }

//     const existingUserIds = (
//       await prisma.user.findMany({
//         select: { id: true },
//       })
//     ).map((user) => user.id);

//     const requestIds: number[] = [];
//     for (const userId of createdUserIds) {
//       for (let i = 0; i < seedRequestsPerUser; i += 1) {
//         const title = faker.lorem.words({ min: 2, max: 5 }).slice(0, 50);
//         const details1 = faker.lorem.paragraph({ min: 2, max: 4 });
//         const details2 = maybeNull(faker.lorem.paragraph({ min: 1, max: 2 }));
//         const details3 = maybeNull(faker.lorem.sentences({ min: 1, max: 2 }), 0.5);

//         const request = await prisma.request.create({
//           data: {
//             title,
//             tag1: randomTag().slice(0, 50),
//             tag2: maybeNull(randomTag().slice(0, 50), 0.4),
//             details1,
//             details2,
//             details3,
//             date: faker.date.between({
//               from: "2023-01-01T00:00:00.000Z",
//               to: new Date(),
//             }),
//             userId,
//           },
//           select: { id: true },
//         });

//         requestIds.push(request.id);
//       }
//     }

//     const commentPayload: Array<{
//       details: string;
//       userId: number;
//       requestId: number;
//       date: Date;
//     }> = [];

//     for (const requestId of requestIds) {
//       const amount = faker.number.int({
//         min: Math.max(2, seedCommentsPerRequest - 2),
//         max: seedCommentsPerRequest + 3,
//       });

//       for (let i = 0; i < amount; i += 1) {
//         commentPayload.push({
//           details: faker.lorem.sentences({ min: 1, max: 3 }),
//           userId: existingUserIds[Math.floor(Math.random() * existingUserIds.length)],
//           requestId,
//           date: faker.date.recent({ days: 180 }),
//         });
//       }
//     }

//     for (let i = 0; i < commentPayload.length; i += 500) {
//       await prisma.comment.createMany({
//         data: commentPayload.slice(i, i + 500),
//       });
//     }

//     console.info(
//       `Seed complete: +${createdUserIds.length} users, +${requestIds.length} requests, +${commentPayload.length} comments`,
//     );
//     console.info("Shared test password for seeded users: Password123!");
//   } catch (error) {
//     const err = error as Error;
//     console.error("Seed failed:", err.message);
//     console.error(err.stack);
//     process.exitCode = 1;
//   } finally {
//     await prisma.$disconnect();
//   }
// };

// void seed();
