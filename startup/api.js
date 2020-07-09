const Joi = require("@hapi/joi");
const helmet = require("helmet");
const bodyParser = require("body-parser");

module.exports = function (app) {
  Joi.objectId = require("joi-objectid")(Joi);
  app.use(helmet());
  app.use(bodyParser.json());
};
