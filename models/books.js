const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const { authorSchema } = require("./authors");
const { categorySchema } = require("./categories");
const { publisherSchema } = require("./publishers");

const Book = mongoose.model(
  "Book",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    author: {
      type: authorSchema,
      required: true,
    },
    category: {
      type: categorySchema,
      required: true,
    },
    publisher: {
      type: publisherSchema,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
    },
    availableBooks: {
      type: Number,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
    },
    yearlyLends: {
      type: Number,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is nor an integer value",
      },
    },
  })
);

function validateBook(book) {
  const idPattern = /^[0-9a-fA-F]{24}$/;

  const schema = Joi.object({
    title: Joi.string().min(3).max(50).required(),
    authorId: Joi.string().regex(idPattern).required(),
    categoryId: Joi.string().regex(idPattern).required(),
    publisherId: Joi.string().regex(idPattern).required(),
    stock: Joi.number().integer().required(),
    availableBooks: Joi.number().integer(),
    yearlyLends: Joi.number().integer(),
  });

  return schema.validate(book);
}

module.exports.Book = Book;
module.exports.validate = validateBook;
