import "dotenv/config";
import { afterAll, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import supertest from "supertest";
import app from "../../src/app";

interface UserPayload {
  id: string;
  firstname: string;
  lastname: string;
  birthday: string;
  avatar: string;
}

jest.mock("../../src/modules/auth/authAction", () => ({
  login: jest.fn((_req: Request, res: Response) =>
    res.status(200).json({ token: "test-token" }),
  ),
  logout: jest.fn((_req: Request, res: Response) => res.status(204).end()),
  me: jest.fn((_req: Request, res: Response) =>
    res.status(200).json({ id: "1" }),
  ),
  verifyToken: jest.fn((_req: Request, _res: Response, next: NextFunction) => {
    const req = _req as Request & { user: UserPayload };
    req.user = {
      id: "1",
      firstname: "John",
      lastname: "Doe",
      birthday: "2000-01-01",
      avatar: "",
    };
    next();
  }),
  hashPassword: jest.fn((_req: Request, _res: Response, next: NextFunction) =>
    next(),
  ),
}));

jest.mock("../../src/modules/request/requestActions", () => ({
  browse: jest.fn((_req: Request, res: Response) => res.json([])),
  read: jest.fn((_req: Request, res: Response) => {
    if (Number(_req.params.id) === 0) {
      return res.status(404).json({});
    }
    return res.json({});
  }),
  add: jest.fn((_req: Request, res: Response) => res.status(201).json({ insertId: 1 })),
  edit: jest.fn((_req: Request, res: Response) => {
    if (Number(_req.params.id) === 43) {
      return res.status(404).json({});
    }
    return res.status(204).end();
  }),
  destroy: jest.fn((_req: Request, res: Response) => res.status(204).end()),
  isPoster: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

jest.mock("../../src/modules/comment/commentActions", () => ({
  browse: jest.fn((_req: Request, res: Response) => res.json([])),
  read: jest.fn((_req: Request, res: Response) => res.json({})),
  add: jest.fn((_req: Request, res: Response) => res.status(201).json({})),
  edit: jest.fn((_req: Request, res: Response) => res.status(204).end()),
  destroy: jest.fn((_req: Request, res: Response) => res.status(204).end()),
}));

jest.mock("../../src/modules/users/userAction", () => ({
  browse: jest.fn((_req: Request, res: Response) => res.json([])),
  read: jest.fn((_req: Request, res: Response) => res.json({})),
  add: jest.fn((_req: Request, res: Response) => res.status(201).json({})),
  edit: jest.fn((_req: Request, res: Response) => res.status(204).end()),
  destroy: jest.fn((_req: Request, res: Response) => res.status(204).end()),
}));

jest.mock("../../src/modules/users/uploadsAction", () => ({
  addAvatar: jest.fn((_req: Request, res: Response) =>
    res.status(201).json({}),
  ),
}));

afterAll(() => {
  jest.restoreAllMocks();
});

describe("GET /api/request", () => {
  it("should fetch request successfully", async () => {
    const response = await supertest(app).get("/api/request");

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual([]);
  });
});

describe("GET /api/request/:id", () => {
  it("should fetch a single request successfully", async () => {
    const response = await supertest(app).get("/api/request/1");

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({});
  });

  it("should fail on invalid id", async () => {
    const response = await supertest(app).get("/api/request/0");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({});
  });
});

describe("POST /api/request", () => {
  it("should add a new request successfully", async () => {
    const fakeRequest = {
      title: "Hello",
      tag1: "Tag 1",
      tag2: "Tag 2",
      details1: "Details",
      details2: "Details 2",
      details3: "Details 3",
      user_id: 0,
    };

    const response = await supertest(app).post("/api/request").send(fakeRequest);

    expect(response.status).toBe(201);
    expect(response.body.insertId).toBe(1);
  });
});

describe("PUT /api/request/:id", () => {
  it("should update an existing request successfully", async () => {
    const response = await supertest(app).put("/api/request/2").send({
      title: "Hello",
      tag1: "Tag 1",
      tag2: "Tag 2",
      details1: "Details 1",
      details2: "Details 2",
      details3: "Details 3",
      user_id: 3,
    });

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("should fail on invalid id", async () => {
    const response = await supertest(app).put("/api/request/43").send({
      title: "foo",
      tag1: "Tag 1",
      tag2: "Tag 2",
      details1: "Details 1",
      details2: "Details 2",
      details3: "Details 3",
      user_id: 0,
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({});
  });
});

describe("DELETE /api/request/:id", () => {
  it("should delete an existing request successfully", async () => {
    const response = await supertest(app).delete("/api/request/42");

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });
});
