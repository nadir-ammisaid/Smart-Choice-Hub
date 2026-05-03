import "dotenv/config";

const migrate = async () => {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "Refused: legacy migration script is disabled in production. Use `npm run db:migrate:deploy` instead.",
    );
    process.exit(1);
  }

  console.error(
    "Legacy migration script disabled. Use Prisma commands: `npm run db:migrate:dev` (dev) or `npm run db:migrate:deploy` (prod).",
  );
  process.exit(1);
};

void migrate();
