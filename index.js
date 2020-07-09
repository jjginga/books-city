const dbPath = "mongodb://localhost:27017/books-city";

const express = require("express");
const app = express();
const winston = require("winston");

require("./startup/routes")(app);
require("./startup/database")(dbPath);
require("./startup/logging")(dbPath);
require("./startup/config")();
require("./startup/api")(app);

const port = process.env.PORT || 3000;
app.listen(port, () => winston.info(`Listening on port ${port}...`));
