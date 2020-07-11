const request = require("supertest");
const mongoose = require("mongoose");
const { Customer } = require("../../../models/customer");
const { User } = require("../../../models/user");

describe("/api/customers", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await server.close();
    await Customer.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all customers", async () => {
      await Customer.collection.insertMany([
        { name: "customer1" },
        { name: "customer2" },
      ]);

      const res = await request(server).get("/api/customers");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === "customer1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "customer2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    let id;
    let customer;

    const execute = () => {
      return request(server).get(`/api/customers/${id}`);
    };

    beforeEach(async () => {
      customer = new Customer({ name: "customer1" });
      await customer.save();
      id = customer._id.toHexString();
    });

    it("should return 404 if invalid id is passed", async () => {
      id = 1;
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it("should return 404 if no customer with the given id is found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      expect(res.status).toBe(404);
    });

    it("should return a customer if valid id is passed", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", customer.name);
    });
  });

  describe("POST /", () => {
    let token;
    let name;
    let phone;

    const execute = async () => {
      return await request(server)
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({ name, phone });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "customer1";
      phone = "123456789";
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("should return 400 if customer's name is under 5 characters", async () => {
      name = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's name is over 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone is under 9 characters", async () => {
      phone = "1";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone is over 15 characters", async () => {
      phone = new Array(17).join("1");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone isn't a numeric string", async () => {
      phone = new Array(11).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should save customer if it is valid", async () => {
      await execute();

      const customer = await Customer.find({ name: "customer1" });

      expect(customer).not.toBeNull();
    });

    it("should return the customer if it is valid", async () => {
      const res = await execute();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "customer1");
    });
  });

  describe("PUT /:id", () => {
    let token;
    let name;
    let phone;
    let customer;
    let id;

    const execute = async () => {
      return await request(server)
        .put(`/api/customers/${id}`)
        .set("x-auth-token", token)
        .send({ name, phone });
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();
      name = "customer1";
      phone = "123456789";
      customer = new Customer({ name, phone });
      await customer.save();
      id = customer._id.toHexString();
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

    it("should return 400 if customer's name is under 3 characters", async () => {
      name = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's name is over 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone is under 9 characters", async () => {
      phone = "1";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone is over 15 characters", async () => {
      phone = new Array(17).join("1");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone isn't a numeric string", async () => {
      phone = new Array(11).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 404 if no customer with the given id was found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should save customer if it is valid", async () => {
      name = "customer2";
      await execute();

      const customer = await Customer.find({ name });

      expect(customer).not.toBeNull();
    });

    it("should return customer if it is valid", async () => {
      name = "customer2";
      const res = await execute();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let name;
    let phone;
    let customer;
    let id;

    const execute = async () => {
      return await request(server)
        .delete(`/api/customers/${id}`)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      name = "customer1";
      phone = "123456789";
      customer = new Customer({ name, phone });
      await customer.save();
      id = customer._id.toHexString();
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

    it("should return 404 if no customer with the given id was found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should delete customer if is valid", async () => {
      await execute();

      const customer = await Customer.find({ name: "customer1" });

      expect(customer.length).toBe(0);
    });

    it("should return the customer if is valid", async () => {
      const res = await execute();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", customer.name);
    });
  });
});

//GET
//should return all the customers

//GET /:id
//should return 404 if invalid id is passed
//should return 404 if customer with the given id is not found
//should return a customer if valid id is passed

//POST
//should return 401 if client is not logged in
//should return 400 if name is under 5 characters
//should return 400 if name is over 50 characters
//should return 400 if phone is under 9 characters
//should return 400 if phone is over 15 characters
//should return 400 if phone isn't a numeric string
//should save customer if if is valid
//should return customer if it is valid

//PUT
//should return 401 if client is not logged in
//should return 404 if invalid id is passed
//should return 400 if name is under 5 characters
//should return 400 if name is over 50 characters
//should return 400 if phone is under 9 characters
//should return 400 if phone is over 15 characters
//should return 400 if phone isn't a numeric string
//should return 404 if no customer with the given id was found
//should save customer if it is valid
//should return customer if it is valid

//DELETE
//should return 401 if client is not logged in
//should return 403 if client is not admin
//should return 404 if invalid id is passed
//should return 404 if no customer with the given id was found
//should delete customer if is valid
//should return the customer if is valid
