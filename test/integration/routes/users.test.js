const request = require("supertest");
const { User } = require("../../../models/user");

describe("/api/users", () => {
  beforeEach(() => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });

  describe("GET /me", () => {
    let user;
    let token;

    const execute = () => {
      return request(server).get("/api/users/me").set("x-auth-token", token);
    };

    beforeEach(async () => {
      const name = "name";
      const email = "email@email.com";
      const password = "123456";
      user = new User({ name, email, password });
      await user.save();

      token = user.generateAuthToken();
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("should return the user", async () => {
      const res = await execute();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", user.name);
      expect(res.body).toHaveProperty("email", user.email);
    });

    it("should not return the password", async () => {
      const res = await execute();

      expect(res.body).not.toHaveProperty("password");
    });
  });

  describe("POST /", () => {
    let user;
    let name;
    let email;
    let password;

    const execute = () => {
      user = { name, email, password };
      return request(server).post("/api/users/").send(user);
    };

    beforeEach(() => {
      name = "name";
      email = "email@email.com";
      password = "123456";
    });

    it("should return 400 if user's name is under 3 characters", async () => {
      name = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user's name is over 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user's email is under 5 characters", async () => {
      email = "a@.a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user's email is over 255 characters", async () => {
      email = new Array(248).join("a") + "@mail.com";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user's email does not have email format", async () => {
      email = "aaaaa";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user's password is under 6 characters", async () => {
      password = "a";
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user's password is over 255 characters", async () => {
      password = new Array(257).join("a");
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user with given email already registered", async () => {
      const user1 = new User({ name, email, password });
      await user1.save();
      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should save the user", async () => {
      await execute();

      const dbUser = await User.find({ email });
      expect(dbUser).not.toBeNull();
    });

    it("should return the user", async () => {
      const res = await execute();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", user.name);
      expect(res.body).toHaveProperty("email", user.email);
    });

    it("should return the password", async () => {
      const res = await execute();

      expect(res.body).not.toHaveProperty("password");
    });

    it("should return the token in the header", async () => {
      const res = await execute();
      const dbUser = await User.findOne({ email });
      const token = dbUser.generateAuthToken();

      expect(res.header).toHaveProperty("x-auth-token", token);
    });
  });
});

//GET /me
//should return 401 if client is not logged in
//should return the user
//should not return the password

//POST
//should return 400 if user's name is under 3 characters;
//should return 400 if user's name is over 50 characters;
//should return 400 if user's email is under 5 characters;
//should return 400 if user's email is over 255 characters;
//should return 400 if user's email does not have email format;
//should return 400 if password is under 6 characters;
//should return 400 if password is over 255 characters;
//should return 400 if user already registered;
//should save user;
//should return user;
//should not return token
//should return token in header
