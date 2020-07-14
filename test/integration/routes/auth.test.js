const request = require("supertest");
const bcrypt = require("bcrypt");
const { User } = require("../../../models/user");

describe("/api/auth", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });

  describe("POST /", () => {
    let user;
    let email;
    let password;

    const execute = () => {
      return request(server).post("/api/auth").send({ email, password });
    };

    beforeEach(async () => {
      const name = "name1";
      email = "email@email.com";
      password = "123456";
      const hashPassword = await bcrypt.hash("123456", 10);
      user = new User({ name, email, password: hashPassword });
      await user.save();
    });

    it("should return 400 if email is under 5 characters", async () => {
      email = "a@.a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if email is over 255 characters", async () => {
      email = new Array(248).join("a") + "@mail.com";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if email does not have email format", async () => {
      email = "aaaaaa";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if password is under 6 characters", async () => {
      password = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if password is over 255 characters", async () => {
      password = new Array(255).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if there wis no user with the given email", async () => {
      email = "email1@email.com";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return token", async () => {
      const res = await execute();
      const dbUser = await User.findOne({ email });
      const token = await dbUser.generateAuthToken();

      expect(res.status).toBe(200);
      expect(res.text).toEqual(token);
    });
  });
});
