const request = require("supertest");
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
    it("should all authors", async () => {
      await Author.collection.insertMany([
        { firstName: "author1", lastName: "last1" },
        { firstName: "author2", lastName: "last2" },
      ]);

      const res = await request(server).get("/api/authors");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.firstName === "author1")).toBeTruthy();
      expect(res.body.some((g) => g.lastName === "last2")).toBeTruthy();
    });
  });
});
//authors

//GET id
//should return 401 if invalid Id is passed
//should return 404 if no author with the given Id is found
//should return a author if a valid Id is passed

//Post
//should return 401 if client is not logged in
//should return 400 if first name is less than
//should return 400 if last name is less than
//should return 400 if first name is more than
//should return 400 if last name is more than
//should save author if it is valid
//should return author if is valid

//Put
//Delete
