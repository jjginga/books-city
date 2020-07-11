const request = require("supertest");
const mongoose = require("mongoose");
const { Author } = require("../../../models/author");
const { User } = require("../../../models/user");

describe("/api/authors", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await server.close();
    await Author.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all authors", async () => {
      await Author.collection.insertMany([
        { firstName: "firstName1", lastName: "lastName1" },
        { firstName: "firstName2", lastName: "lastName2" },
      ]);

      const res = await request(server).get("/api/authors");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.firstName === "firstName1")).toBeTruthy();
      expect(res.body.some((g) => g.firstName === "firstName2")).toBeTruthy();
      expect(res.body.some((g) => g.lastName === "lastName1")).toBeTruthy();
      expect(res.body.some((g) => g.lastName === "lastName2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    let id;
    let author;

    const execute = () => {
      return request(server).get(`/api/authors/${id}`);
    };

    beforeEach(async () => {
      author = new Author({ firstName: "firstName1", lastName: "lastName1" });
      await author.save();
      id = author._id.toHexString();
    });

    it("should return 404 if invalid id is passed", async () => {
      id = 1;
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it("should return 404 if no author with the given id is found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it("should return an author if valid id is passed", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("firstName", author.firstName);
    });
  });

  describe("POST /", () => {
    let token;
    let firstName;
    let lastName;
    let middleName;

    const execute = async () => {
      return await request(server)
        .post("/api/authors")
        .set("x-auth-token", token)
        .send({ firstName, lastName, middleName });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      firstName = "firstName1";
      lastName = "lastName1";
      middleName = "middleName1";
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("should return 400 if author's first name is under 2 characters", async () => {
      firstName = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if author's first name is over 50 characters", async () => {
      firstName = new Array(52).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if author's last name is under 2 characters", async () => {
      lastName = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if author's last name is over 50 characters", async () => {
      lastName = new Array(52).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if author's middle name is under 2 characters", async () => {
      middleName = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if author's middle name is over 50 characters", async () => {
      middleName = new Array(52).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should save author if it is valid", async () => {
      await execute();

      const author = await Author.find({ name: "author1" });

      expect(author).not.toBeNull();
    });

    it("should return the author if it is valid", async () => {
      const res = await execute();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("firstName", firstName);
      expect(res.body).toHaveProperty("lastName", lastName);
    });
  });

  describe("PUT /:id", () => {
    let token;
    let firstName;
    let lastName;
    let middleName;
    let author;
    let id;

    const execute = async () => {
      return await request(server)
        .put(`/api/authors/${id}`)
        .set("x-auth-token", token)
        .send({ firstName, lastName, middleName });
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();
      firstName = "firstName1";
      lastName = "lastName1";
      middleName = "middleName1";
      author = new Author({ firstName, lastName, middleName });
      await author.save();
      id = author._id.toHexString();
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
    it("should return 400 if author's first name is under 2 characters", async () => {
      firstName = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if author's first name is over 50 characters", async () => {
      firstName = new Array(52).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if author's last name is under 2 characters", async () => {
      lastName = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if author's last name is over 50 characters", async () => {
      lastName = new Array(52).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if author's middle name is under 2 characters", async () => {
      middleName = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if author's middle name is over 50 characters", async () => {
      middleName = new Array(52).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 404 if no publisher with the given id was found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should save author if it is valid", async () => {
      firstName = "firstName2";
      await execute();

      const author = await Author.find({ firstName });

      expect(author).not.toBeNull();
    });

    it("should return author if it is valid", async () => {
      firstName = "firstName2";
      const res = await execute();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("firstName", firstName);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let firstName;
    let lastName;
    let middleName;
    let author;
    let id;

    const execute = async () => {
      return await request(server)
        .delete(`/api/authors/${id}`)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      firstName = "firstName1";
      lastName = "lastName1";
      middleName = "middleName1";
      author = new Author({ firstName, lastName, middleName });
      await author.save();
      id = author._id.toHexString();
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

    it("should return 404 if no author with the given id was found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should delete author if is valid", async () => {
      await execute();

      const author = await Author.find({ firstName });

      expect(author.length).toBe(0);
    });

    it("should return the author if is valid", async () => {
      const res = await execute();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("firstName", author.firstName);
    });
  });
});

//Authors

//GET
//should return all authors

//GET id
//should return 401 if invalid id is passed
//should return 404 if no author with the given id is found
//should return a author if a valid Id is passed

//Post
//should return 401 if client is not logged in
//should return 400 if author's first name is under 2 characters
//should return 400 if author's first name is over 50 characters
//should return 400 if author's last name is under 2 characters
//should return 400 if author's last name is over 50 characters
//should return 400 if author's middle name is under 2 characters
//should return 400 if author's middle name is over 50 characters
//should save author if it is valid
//should return author if is valid

//Put
//should return 401 if client is not logged in
//should return 404 if invalid id is passed
//should return 400 if author's first name is under 2 characters
//should return 400 if author's first name is over 50 characters
//should return 400 if author's last name is under 2 characters
//should return 400 if author's last name is over 50 characters
//should return 400 if author's middle name is under 2 characters
//should return 400 if author's middle name is over 50 characters
//should return 404 if no author with the given id was found
//should save author if it is valid
//should return author if is valid

//Delete
//should return 401 if client is not logged in
//should return 403 if client is not admin
//should return 404 if invalid id is passed
//should return 404 if no author with the given id was found
//should delete author if is valid
//should return the author if is valid
