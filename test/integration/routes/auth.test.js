const request = require("supertest");
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

    const execute = async () => {
      return await request(server).post("/api/auth").send({ email, password });
    };

    beforeEach(async () => {
      const name = "name1";
      email = "email@email.com";
      password = "123456";
      user = new User({ name, email, password });
      await user.save();
    });

    it("should return 400 if email is under 5 characters", async () => {
      email = "1";
      const res = await execute();

      expect(res.status).toBe(400);
    });
  });
});

//POST
//should return 400 if email is under 5 characters
//should return 400 if email is over 255 characters
//should return 400 if email does not have email format
//should return 400 if password is under 6 characters
//should return 400 if password is over 255 characters
//should return 400 if there is no user with given email
//should return 400 if password is invalid
//should return token
