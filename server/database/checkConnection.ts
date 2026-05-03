import prisma from "../src/lib/prisma";

// Try to get a connection to the database
prisma
  .$connect()
  .then(() => {
    console.info("Using database connection via Prisma");
  })
  .catch((error: Error) => {
    console.warn(
      "Warning:",
      "Failed to establish a database connection.",
      "Please check your database credentials in the .env file if you need a database access.",
    );
    console.warn(error.message);
  });
