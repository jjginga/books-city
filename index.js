const express = require("express");
const app = express();
const winston = require("winston");
const config = require("config");

const dbPath = config.get("database");

require("./startup/routes")(app);
require("./startup/database")(dbPath);
require("./startup/logging")(dbPath);
require("./startup/config")();
require("./startup/api")(app);
require("./startup/prod")(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;
