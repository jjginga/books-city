const request = require("supertest");
const { User } = require("../../../models/user");
const { Category } = require("../../../models/category");

describe("auth middleware", () => {
  beforeEach(() => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await Category.remove({});
    server.close();
  });

  let token;

  const execute = () => {
    return request(server)
      .post("/api/categories")
      .set("x-auth-token", token)
      .send({ name: "category" });
  };

  beforeEach(() => {
    token = new User().generateAuthToken();
  });
  it("should return 401 if no token is provided", async () => {
    token = "";

    const res = await execute();
    expect(res.status).toBe(401);
  });

  it("should return 400 if no token is provided", async () => {
    token = "a";

    const res = await execute();
    expect(res.status).toBe(400);
  });

  it("should return 200 if no token is provided", async () => {
    const res = await execute();
    expect(res.status).toBe(200);
  });
});
