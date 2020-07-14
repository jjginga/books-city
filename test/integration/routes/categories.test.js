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
    let id;
    let category;

    const execute = () => {
      return request(server).get(`/api/categories/${id}`);
    };

    beforeEach(async () => {
      category = new Category({ name: "category1" });
      await category.save();
      id = category._id.toHexString();
    });

    it("should return 404 if invalid id is passed", async () => {
      id = 1;
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it("should return 404 if no category with the given id is found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it("should return a category if valid id is passed", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", category.name);
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

    it("should return 400 if category's name is under 3 characters", async () => {
      name = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if category's name is over 50 characters", async () => {
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

  describe("PUT /:id", () => {
    let token;
    let name;
    let category;
    let id;

    const execute = async () => {
      return await request(server)
        .put(`/api/categories/${id}`)
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();
      name = "category1";
      category = new Category({ name });
      await category.save();
      id = category._id.toHexString();
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("should return 404 if invalid id is passed", async () => {
      id = "1";
      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should return 400 if category's name is under 3 characters", async () => {
      name = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if category's name is over 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 404 if no category with the given id was found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should save category if it is valid", async () => {
      name = "category2";
      await execute();

      const category = await Category.find({ name });

      expect(category).not.toBeNull();
    });

    it("should return the new category if it is valid", async () => {
      name = "category2";
      const res = await execute();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let name;
    let category;
    let id;

    const execute = async () => {
      return await request(server)
        .delete(`/api/categories/${id}`)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      name = "category1";
      category = new Category({ name });
      await category.save();
      id = category._id.toHexString();
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("should return 403 if client is not admin", async () => {
      token = new User().generateAuthToken();
      const res = await execute();

      expect(res.status).toBe(403);
    });

    it("should return 404 if invalid id is passed", async () => {
      id = "1";
      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should return 404 if no category with the given id was found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should delete category if is valid", async () => {
      await execute();

      const category = await Category.find({ name: "category1" });

      expect(category.length).toBe(0);
    });

    it("should return the category if is valid", async () => {
      const res = await execute();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", category.name);
    });
  });
});
