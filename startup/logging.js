const winston = require("winston");
require("winston-mongodb");
require("express-async-errors");

module.exports = function (dbPath) {
  const dbLogging = {
    db: dbPath,
    level: "info",
    options: { useUnifiedTopology: true },
  };

  //logging
  winston.add(new winston.transports.MongoDB(dbLogging));
  winston.add(new winston.transports.Console());

  //unhandled exceptions
  winston.exceptions.handle(new winston.transports.MongoDB(dbLogging));
  winston.exceptions.handle(
    new winston.transports.Console({ colorize: true, prettyPrint: true })
  );

  //unhandled promise rejection - throwing for winston to be able to caught it
  process.on("unhandledRejection", (ex) => {
    throw ex;
  });
};
