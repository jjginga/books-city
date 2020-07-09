const winston = require("winston");
const mongoose = require("mongoose");

module.exports = function (dbPath) {
  mongoose
    .connect(dbPath, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => winston.info("Connected to the database..."));
};
