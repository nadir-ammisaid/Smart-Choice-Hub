import "dotenv/config";
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import prisma from "../../src/lib/prisma";
import requestRepository from "../../src/modules/request/requestRepository";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("requestRepository", () => {
  describe("read", () => {
    it("should return a request when id is valid", async () => {
      jest.spyOn(prisma.request, "findUnique").mockResolvedValueOnce({
        id: 1,
        date: new Date("2024-03-15T00:00:00.000Z"),
        title: "Test Request",
        tag1: "Tag1",
        tag2: "Tag2",
        details1: "Detail 1",
        details2: "Detail 2",
        details3: "Detail 3",
        userId: 1,
        user: {
          firstName: "John",
          lastName: "Doe",
          avatar: null,
        },
      } as never);

      const result = await requestRepository.read(1);

      expect(prisma.request.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
      expect(result).toEqual({
        id: 1,
        date: "2024-03-15",
        title: "Test Request",
        tag1: "Tag1",
        tag2: "Tag2",
        details1: "Detail 1",
        details2: "Detail 2",
        details3: "Detail 3",
        user_id: 1,
        firstname: "John",
        lastname: "Doe",
        avatar: null,
      });
    });

    it("should return null when request is not found", async () => {
      jest.spyOn(prisma.request, "findUnique").mockResolvedValueOnce(null);

      const result = await requestRepository.read(999);

      expect(prisma.request.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 999 } }),
      );
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a new request and return insert ID", async () => {
      const newRequest = {
        title: "New Request",
        tag1: "Tag1",
        tag2: "Tag2",
        details1: "Detail 1",
        details2: "Detail 2",
        details3: "Detail 3",
        user_id: 1,
      };

      jest.spyOn(prisma.request, "create").mockResolvedValueOnce({
        id: 123,
      } as never);

      const result = await requestRepository.create(newRequest);

      expect(prisma.request.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: "New Request" }),
        }),
      );
      expect(result).toBe(123);
    });
  });
});
