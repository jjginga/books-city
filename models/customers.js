//load modules
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

//model definition
const Customer = mongoose.model(
  "Customer",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
    phone: {
      type: String,
      minlength: 9,
      maxlength: 15,
    },
    isGold: {
      type: Boolean,
      default: false,
    },
  })
);

//model validation
function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    phone: Joi.string().min(9).max(15).required(),
    isGold: Joi.boolean(),
  });

  return schema.validate(customer);
}

//exports
module.exports.Customer = Customer;
module.exports.validate = validateCustomer;
