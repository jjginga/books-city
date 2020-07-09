const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) return res.status(401).send("No token provided. Access denied");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

    //we get the { _id: this._id } object

    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
};
