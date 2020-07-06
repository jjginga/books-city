const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
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
    monthlySales: {
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
  const schema = Joi.object({
    title: Joi.string().min(3).max(50).required(),
    authorId: Joi.objectId().required(),
    categoryId: Joi.objectId().required(),
    publisherId: Joi.objectId().required(),
    stock: Joi.number().integer().required(),
    monthlySales: Joi.number().integer(),
  });

  return schema.validate(book);
}

module.exports.Book = Book;
module.exports.validate = validateBook;
