const request = require("supertest");
const mongoose = require("mongoose");
const { Publisher } = require("../../../models/publisher");
const { User } = require("../../../models/user");

describe("/api/publishers", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await server.close();
    await Publisher.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all publishers", async () => {
      await Publisher.collection.insertMany([
        { name: "publisher1" },
        { name: "publisher2" },
      ]);

      const res = await request(server).get("/api/publishers");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === "publisher1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "publisher2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    let id;
    let publisher;

    const execute = () => {
      return request(server).get(`/api/publishers/${id}`);
    };

    beforeEach(async () => {
      publisher = new Publisher({ name: "publisher1" });
      await publisher.save();
      id = publisher._id.toHexString();
    });

    it("should return 404 if invalid id is passed", async () => {
      id = 1;
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it("should return 404 if no publisher with the given id is found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it("should return a publisher if valid id is passed", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", publisher.name);
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    const execute = async () => {
      return await request(server)
        .post("/api/publishers")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "publisher1";
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("should return 400 if publisher's name is under 3 characters", async () => {
      name = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if publisher's name is over 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should save publisher if it is valid", async () => {
      await execute();

      const publisher = await Publisher.find({ name: "publisher1" });

      expect(publisher).not.toBeNull();
    });

    it("should return the publisher if it is valid", async () => {
      const res = await execute();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "publisher1");
    });
  });

  describe("PUT /:id", () => {
    let token;
    let name;
    let publisher;
    let id;

    const execute = async () => {
      return await request(server)
        .put(`/api/publishers/${id}`)
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();
      name = "publisher1";
      publisher = new Publisher({ name });
      await publisher.save();
      id = publisher._id.toHexString();
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

    it("should return 400 if publisher's name is under 3 characters", async () => {
      name = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if publisher's name is over 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 404 if no publisher with the given id was found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should save publisher if it is valid", async () => {
      name = "publisher2";
      await execute();

      const publisher = await Publisher.find({ name });

      expect(publisher).not.toBeNull();
    });

    it("should return publisher if it is valid", async () => {
      name = "publisher2";
      const res = await execute();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let name;
    let publisher;
    let id;

    const execute = async () => {
      return await request(server)
        .delete(`/api/publishers/${id}`)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      name = "publisher1";
      publisher = new Publisher({ name });
      await publisher.save();
      id = publisher._id.toHexString();
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

    it("should return 404 if no publisher with the given id was found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should delete publisher if is valid", async () => {
      await execute();

      const publisher = await Publisher.find({ name: "publisher1" });

      expect(publisher.length).toBe(0);
    });

    it("should return the publisher if is valid", async () => {
      const res = await execute();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", publisher.name);
    });
  });
});

//GET
//should return all publishers

//Get /:id
//should return 404 if invalid Id is passed
//should return 404 if no publisher with the given ID is found
//should return a publisher if valid id is passed

//POST
//should return 401 if client is not logged in
//should return 400 if publisher's name is under 5 characters
//should return 400 if publisher's name is over 50 characters
//should save publisher if if is valid
//should return publisher if it is valid

//PUT
//should return 401 if client is not logged in
//should return 404 if invalid id is passed
//should return 400 if publisher's name is under 5 characters
//should return 400 if publisher's name is over 50 characters
//should return 404 if no publisher with the given id was found
//should save publisher with the changes
//should return publisher if it is valid

//DELETE
//should return 401 if client is not logged if
//should return 403 if client is not admin
//should return 404 if invalid id is passed
//should return 404 if no publisher with the given id was found
//should delete publisher if is valid
//should return the publisher if is valid
