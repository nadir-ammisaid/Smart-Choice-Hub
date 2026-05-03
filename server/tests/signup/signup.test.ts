import "dotenv/config";
import { afterAll, describe, expect, test } from "@jest/globals";
// on utilise faker pour créer un newUser dynamique et éviter de devoir supprimer la BDD à chaque utilisation à cause des champs uniques dans la BDD
import { faker } from "@faker-js/faker";
import request from "supertest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";

//test d'intégration

describe("Test pour création d utilisateur", () => {
  test("devrait créer un utilisateur et le retourner", async () => {
    const newUser = {
      email: faker.internet.email(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      // On utilise cette syntaxe pour avoir un format de date YYYY-MM-DD
      birthday: faker.date.birthdate().toISOString().split("T")[0],
      password: faker.internet.password(),
    };

    const response = await request(app).post("/api/users/").send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("userId");
    expect(typeof response.body.userId).toBe("number");
  });
});

// on ferme l'appel à la BDD pour éviter une boucle
afterAll(async () => {
  await prisma.$disconnect();
});
