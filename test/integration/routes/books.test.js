const request = require("supertest");
const mongoose = require("mongoose");
const { Book } = require("../../../models/book");
const { Author } = require("../../../models/author");
const { Category } = require("../../../models/category");
const { Publisher } = require("../../../models/publisher");
const { User } = require("../../../models/user");

describe("/api/books", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await server.close();
    await Book.deleteMany({});
    await Author.deleteMany({});
    await Category.deleteMany({});
    await Publisher.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all books", async () => {
      const author = await authorStore();
      const category = await categoryStore();
      const publisher = await publisherStore();

      await Book.collection.insertMany([
        {
          title: "book1",
          authorId: author._id,
          categoryId: category._id,
          publisherId: publisher._id,
          stock: 1,
        },
        {
          title: "book2",
          authorId: author._id,
          categoryId: category._id,
          publisherId: publisher._id,
          stock: 1,
        },
      ]);

      const res = await request(server).get("/api/books");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.title === "book1")).toBeTruthy();
      expect(res.body.some((g) => g.title === "book2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    let id;
    let book;

    const execute = () => {
      return request(server).get(`/api/books/${id}`);
    };
    beforeEach(async () => {
      const author = await authorStore();
      const category = await categoryStore();
      const publisher = await publisherStore();

      await Book.collection.insertOne({
        title: "book1",
        authorId: author._id,
        categoryId: category._id,
        publisherId: publisher._id,
        stock: 1,
      });

      book = await Book.findOne({ title: "book1" });

      id = book._id.toHexString();
    });
    it("should return 404 if invalid id is passed", async () => {
      id = 1;
      const res = await execute();
      expect(res.status).toBe(404);
    });
    it("should return 404 if no book with the given id is found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it("should return a book if valid id is passed", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", book.title);
    });
  });

  describe("POST /", () => {
    let token;
    let title;
    let authorId;
    let categoryId;
    let publisherId;
    let stock;

    const execute = () => {
      return request(server)
        .post("/api/books")
        .set("x-auth-token", token)
        .send({ title, authorId, categoryId, publisherId, stock });
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();

      const author = await authorStore();
      const category = await categoryStore();
      const publisher = await publisherStore();

      title = "book1";
      authorId = author._id;
      categoryId = category._id;
      publisherId = publisher._id;
      stock = 1;
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("should return 400 if title is under 3 characters ", async () => {
      title = "a";
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if authorId is not provided ", async () => {
      authorId = "";
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if categoryId is not provided ", async () => {
      categoryId = "";
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if publisherId is not provided ", async () => {
      publisherId = "";
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if stock is not provided ", async () => {
      stock = "";
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if no author with given id exists ", async () => {
      authorId = new mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if categoryId with given id exists", async () => {
      categoryId = new mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if publisherId with given id exists", async () => {
      publisherId = new mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should save book if it is valid", async () => {
      await execute();

      const book = await Book.find({ title });

      expect(book).not.toBeNull();
    });

    it("should return the book if it is valid", async () => {
      const res = await execute();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", title);
    });
  });

  describe("PUT /:id", () => {
    let token;
    let title;
    let authorId;
    let categoryId;
    let publisherId;
    let stock;
    let book;
    let id;

    const execute = () => {
      return request(server)
        .put(`/api/books/${id}`)
        .set("x-auth-token", token)
        .send({ title, authorId, categoryId, publisherId, stock });
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();

      const author = await authorStore();
      const category = await categoryStore();
      const publisher = await publisherStore();

      title = "book1";
      authorId = author._id;
      categoryId = category._id;
      publisherId = publisher._id;
      stock = 1;

      await Book.collection.insertOne({
        title,
        authorId,
        categoryId,
        publisherId,
        stock,
      });

      book = await Book.findOne({ title: "book1" });

      id = book._id.toHexString();
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

    it("should return 400 if title is under 3 characters ", async () => {
      title = "a";
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if authorId is not provided ", async () => {
      authorId = "";
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if categoryId is not provided ", async () => {
      categoryId = "";
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if publisherId is not provided ", async () => {
      publisherId = "";
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if stock is not provided ", async () => {
      stock = "";
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if no author with given id exists ", async () => {
      authorId = new mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if categoryId with given id exists", async () => {
      categoryId = new mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if publisherId with given id exists", async () => {
      publisherId = new mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 404 if no book with the given id was found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should save book if it is valid", async () => {
      await execute();

      const book = await Book.find({ title });

      expect(book).not.toBeNull();
    });

    it("should return the new book if it is valid", async () => {
      title = "book2";
      const res = await execute();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", title);
    });
  });

  describe("DELETE /:id", () => {
    let id;
    let token;
    let book;

    const execute = () => {
      return request(server)
        .delete(`/api/books/${id}`)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();

      const author = await authorStore();
      const category = await categoryStore();
      const publisher = await publisherStore();

      await Book.collection.insertOne({
        title: "book1",
        authorId: author._id,
        categoryId: category._id,
        publisherId: publisher._id,
        stock: 1,
      });

      book = await Book.findOne({ title: "book1" });

      id = book._id.toHexString();
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("should return 403 if client is admin", async () => {
      token = new User().generateAuthToken();
      const res = await execute();

      expect(res.status).toBe(403);
    });

    it("should return 404 if invalid id is passed", async () => {
      id = "1";
      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should return 404 if no book with the given id is found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it("should delete book if is valid", async () => {
      await execute();

      book = await Book.find({ title: book.title });

      expect(book.length).toBe(0);
    });
    it("should return a book if is valid", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", book.title);
    });
  });
});

const authorStore = async () => {
  const author = new Author({ firstName: "firstName1", lastName: "lastName1" });
  return await author.save();
};

const categoryStore = async () => {
  const category = new Category({ name: "category1" });
  return await category.save();
};

const publisherStore = async () => {
  const publisher = new Publisher({ name: "publisher1" });
  return await publisher.save();
};
