//load modules
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

//model definition
const Category = mongoose.model(
  "Category",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
  })
);

//model validation
function validateCategory(category) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
  });

  return schema.validate(category);
}

module.exports.Category = Category;
module.exports.validate = validateCategory;
