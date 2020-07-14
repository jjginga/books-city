const { Lend } = require("../../../models/lending");
const { User } = require("../../../models/user");
const { Book } = require("../../../models/book");
const { Customer } = require("../../../models/customer");
const mongoose = require("mongoose");
const request = require("supertest");

describe("/api/lendings", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await server.close();
    await Lend.deleteMany({});
    await Book.deleteMany({});
    await Customer.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all  lendings", async () => {
      const customerId1 = getId();
      const customerId2 = getId();
      const bookId1 = getId();
      const bookId2 = getId();

      await Lend.collection.insertMany([
        { customerId: customerId1, bookId: bookId1 },
        { customerId: customerId2, bookId: bookId2 },
      ]);

      const res = await request(server).get("/api/lendings");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.customerId === customerId1)).toBeTruthy();
      expect(res.body.some((g) => g.customerId === customerId2)).toBeTruthy();
      expect(res.body.some((g) => g.bookId === bookId1)).toBeTruthy();
      expect(res.body.some((g) => g.bookId === bookId2)).toBeTruthy();
    });
  });

  describe("POST /", () => {
    let token;
    let customerId;
    let bookId;
    let customer;
    let book;

    beforeEach(async () => {
      token = new User().generateAuthToken();
      book = await bookStore();
      customer = await customerStore();
      bookId = book._id;
      customerId = customer._id;
    });

    const execute = () => {
      return request(server)
        .post("/api/lendings")
        .set("x-auth-token", token)
        .send({ customerId, bookId });
    };

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("should return 400 if customerId is not provided", async () => {
      customerId = "";
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if bookId is not provided", async () => {
      bookId = "";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if there is no customer with given id", async () => {
      customerId = getId();
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("should return 400 if there is no book with given id", async () => {
      bookId = getId();
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer already has a book", async () => {
      await Customer.findByIdAndUpdate(customerId, {
        hasBook: true,
      });

      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if there are no available books", async () => {
      await Book.findByIdAndUpdate(bookId, {
        availableBooks: 0,
      });
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 200 if valid request", async () => {
      const res = await execute();

      expect(res.status).toBe(200);
    });

    it("should update customer status", async () => {
      await execute();

      const dbCustomer = await Customer.findById(customerId);
      expect(dbCustomer.hasBook).toBeTruthy();
    });

    it("should decrease book stock on lend", async () => {
      await execute();

      const dbBook = await Book.findById(bookId);
      expect(dbBook.availableBooks).toBe(book.availableBooks - 1);
    });

    it("should set return date on valid request", async () => {
      const res = await execute();
      const dbLend = await Lend.findById(res.body._id);
      const timeDiff = Date.now() - dbLend.dueDate;
      expect(timeDiff).toBeLessThan(10 * 1000);
    });

    it("should return the lending if the request is valid", async () => {
      const res = await execute();

      expect(res.body).toHaveProperty("customer.name", customer.name);
      expect(res.body).toHaveProperty("book.title", book.title);
      expect(res.body).toHaveProperty("dueDate");
      expect(res.body).toHaveProperty("outDate");
    });
  });

  describe("PUT /:id", () => {
    let token;
    let customerId;
    let bookId;
    let customer;
    let book;
    let lend;

    beforeEach(async () => {
      token = new User().generateAuthToken();
      book = await bookStore();
      customer = await customerStore();
      bookId = book._id;
      customerId = customer._id;
      lend = await lendStore(customer, book);
    });

    const execute = () => {
      return request(server)
        .put("/api/lendings/")
        .set("x-auth-token", token)
        .send({ customerId, bookId });
    };

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("should return 400 if customerId is not provided", async () => {
      customerId = "";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if bookId is not provided", async () => {
      bookId = "";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 404 if no lend is found for given customerId and bookId", async () => {
      await Lend.deleteOne({});

      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should return 400 if lend has already been processed", async () => {
      lend.returnDate = Date.now();
      await lend.save();

      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 200 if valid request", async () => {
      const res = await execute();

      expect(res.status).toBe(200);
    });

    it("should add seven days to return date", async () => {
      const res = await execute();
      const dbLend = await Lend.findById(res.body._id);
      const timeDiff = Date.now() - dbLend.dueDate;
      expect(timeDiff).toBeLessThan(7 * 60 * 24 * 10 * 1000);
    });

    it("should return the lending if the request is valid", async () => {
      const res = await execute();

      expect(res.body).toHaveProperty("customer.name", customer.name);
      expect(res.body).toHaveProperty("book.title", book.title);
      expect(res.body).toHaveProperty("dueDate");
      expect(res.body).toHaveProperty("outDate");
    });
  });
});

const getId = () => {
  return new mongoose.Types.ObjectId().toHexString();
};

const bookStore = async () => {
  const book = new Book({
    title: "123",
    author: {
      firstName: "123",
      lastName: "12345",
    },
    category: {
      name: "123",
    },
    publisher: {
      name: "12345",
    },
    stock: 1,
    availableBooks: 1,
  });
  return await book.save();
};

const customerStore = async () => {
  const customer = new Customer({
    name: "12345",
    phone: "123456789",
    hasBook: false,
  });

  return await customer.save();
};

const lendStore = async (customer, book) => {
  const lend = new Lend({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    book: {
      _id: book._id,
      title: book.title,
    },
  });

  return await lend.save();
};
