const Joi = require("@hapi/joi");
const bodyParser = require("body-parser");

module.exports = function (app) {
  Joi.objectId = require("joi-objectid")(Joi);
  app.use(bodyParser.json());
};
