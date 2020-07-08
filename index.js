//load modules
//npm
const debuger = require("debug")("app:debug");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Joi = require("@hapi/joi");
const config = require("config");

//express
const express = require("express");
const app = express();

//Custom
const home = require("./routes/home");
const categories = require("./routes/categories");
const customers = require("./routes/customers");
const authors = require("./routes/authors");
const publishers = require("./routes/publishers");
const books = require("./routes/books");
const lends = require("./routes/lendings");
const users = require("./routes/users");
const auth = require("./routes/auth");

Joi.objectId = require("joi-objectid")(Joi);

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

//connect to the database
mongoose
  .connect("mongodb://localhost:27017/books-city", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => debuger("Connected to the database..."))
  .catch((error) => debuger(error.message));

//Middleware
app.use(express.json());

//Third Party Middleware
app.use(helmet());
app.use(bodyParser.json());

//Custom
app.use("/", home);
app.use("/api/categories", categories);
app.use("/api/customers", customers);
app.use("/api/authors", authors);
app.use("/api/publishers", publishers);
app.use("/api/books", books);
app.use("/api/lendings", lends);
app.use("/api/users", users);
app.use("/api/auth", auth);

if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  debuger("Morgan enabled!!!");
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
