const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },

  middleName: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },

  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
});

const Author = mongoose.model("Author", authorSchema);

function validateAuthor(author) {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    middleName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50).required(),
  });

  return schema.validate(author);
}

module.exports.Author = Author;
module.exports.authorSchema = authorSchema;
module.exports.validate = validateAuthor;
