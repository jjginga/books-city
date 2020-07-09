const express = require("express");

const home = require("../routes/home");
const categories = require("../routes/categories");
const customers = require("../routes/customers");
const authors = require("../routes/authors");
const publishers = require("../routes/publishers");
const books = require("../routes/books");
const lends = require("../routes/lendings");
const users = require("../routes/users");
const auth = require("../routes/auth");
const err = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());

  app.use("/", home);
  app.use("/api/categories", categories);
  app.use("/api/customers", customers);
  app.use("/api/authors", authors);
  app.use("/api/publishers", publishers);
  app.use("/api/books", books);
  app.use("/api/lendings", lends);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use(err);
};
