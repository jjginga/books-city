const request = require("supertest");
const mongoose = require("mongoose");
const { Category } = require("../../../models/category");
const { User } = require("../../../models/user");

describe("/api/categories", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await server.close();
    await Category.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all categories", async () => {
      await Category.collection.insertMany([
        { name: "category1" },
        { name: "category2" },
      ]);

      const res = await request(server).get("/api/categories");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === "category1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "category2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return a category if valid Id is passed", async () => {
      const category = new Category({ name: "category1" });
      await category.save();

      const res = await request(server).get(
        `/api/categories/${category._id.toHexString()}`
      );
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", category.name);
    });

    it("should return 404 if invalid Id is passed", async () => {
      const res = await request(server).get(`/api/categories/1`);
      expect(res.status).toBe(404);
    });
    it("should return 404 if no category with the given Id is found", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      const res = await request(server).get(`/api/categories/${id}`);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    const execute = async () => {
      return await request(server)
        .post("/api/categories")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "category1";
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("should return 400 if category is less than 3 characters", async () => {
      name = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if category is more than 3 characters", async () => {
      name = new Array(52).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should save category if it is valid", async () => {
      await execute();

      const category = await Category.find({ name: "category1" });

      expect(category).not.toBeNull();
    });

    it("should return the category if it is valid", async () => {
      const res = await execute();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "category1");
    });
  });
});
