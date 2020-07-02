//load modules
//npm
const debuger = require("debug")("app:debug");
const morgan = require("morgan");
const helmet = require("helmet");

//express
const express = require("express");
const app = express();

//Custom
const home = require("./routes/home");
const categories = require("./routes/categories");

//Middleware
app.use(express.json());

//Third Party Middleware
app.use(helmet());

//Custom
app.use("/", home);
app.use("/api/categories", categories);

if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  debuger("Morgan enabled!!!");
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
