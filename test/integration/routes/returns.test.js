const { Lend } = require("../../../models/lending");
const { User } = require("../../../models/user");
const { Book } = require("../../../models/book");
const { Customer } = require("../../../models/customer");
const mongoose = require("mongoose");
const request = require("supertest");

describe("/api/returns", () => {
  let customerId;
  let bookId;
  let lend;
  let token;
  let book;
  let customer;

  beforeEach(async () => {
    server = require("../../../index");

    customerId = new mongoose.Types.ObjectId();
    bookId = new mongoose.Types.ObjectId();
    token = new User().generateAuthToken();

    book = new Book({
      _id: bookId,
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
      stock: 10,
      availableBooks: 9,
    });

    customer = new Customer({
      _id: customerId,
      name: "12345",
      phone: "123456789",
      hasBook: true,
    });

    lend = new Lend({
      customer: {
        _id: customerId,
        name: "12345",
        phone: "123456789",
      },
      book: {
        _id: bookId,
        title: "book",
      },
    });

    await book.save();
    await customer.save();
    await lend.save();
  });

  afterEach(async () => {
    await server.close();
    await Lend.deleteMany({});
    await Book.deleteMany({});
    await Customer.deleteMany({});
  });

  const execute = () => {
    return request(server)
      .post("/api/returns")
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

  it("should set return date on valid request", async () => {
    await execute();
    const dbLend = await Lend.findById(lend._id);
    const timeDiff = Date.now() - dbLend.returnDate;
    expect(timeDiff).toBeLessThan(10 * 1000);
  });

  it("should calculate penalty", async () => {
    lend.dueDate = Date.now() - 1 * 24 * 60 * 60 * 1000;
    lend.save();
    await execute();
    const dbLend = await Lend.findById(lend._id);

    expect(dbLend.penalty).toBe(1);
  });

  it("should increase movie stock on return", async () => {
    await execute();

    const dbBook = await Book.findById(book._id);
    expect(dbBook.availableBooks).toBe(book.availableBooks + 1);
  });

  it("should update customer status", async () => {
    await execute();

    const dbCustomer = await Customer.findById(customer._id);
    expect(dbCustomer.hasBook).toBeFalsy();
  });

  it("should return the rental if the request is valid", async () => {
    const res = await execute();

    const dbLend = await Lend.findById(lend._id);
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        "outDate",
        "returnDate",
        "dueDate",
        "customer",
        "book",
      ])
    );
  });
});
