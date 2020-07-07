const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const Lend = mongoose.model(
  "Lend",
  new mongoose.Schema({
    customer: {
      type: new mongoose.Schema({
        name: { type: String, required: true, minlength: 5, maxlength: 50 },
        phone: { type: String, minlength: 9, maxlength: 15, match: [/^\d+$/] },
        hasBook: { type: Boolean, default: false },
      }),
    },
    book: {
      type: new mongoose.Schema({
        title: {
          type: String,
          required: true,
          trim: true,
          minlength: 3,
          maxlength: 50,
        },
      }),
    },
    outDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    returnDate: {
      type: Date,
      default: () => Date.now() + 7 * 24 * 60 * 60 * 1000,
    },
    hasReturned: {
      type: Boolean,
      default: false,
    },
    penality: {
      type: Number,
      min: 0,
    },
  })
);

function validateLend(lend) {
  const idPattern = /^[0-9a-fA-F]{24}$/;

  const schema = Joi.object({
    customerId: Joi.string().regex(idPattern).required(),
    bookId: Joi.string().regex(idPattern).required(),
  });

  return schema.validate(lend);
}

function validateReturn(lend) {
  const schema = Joi.object({
    hasReturned: Joi.boolean(),
  });

  return schema.validate(lend);
}

module.exports.Lend = Lend;
module.exports.validate = validateLend;
module.exports.validateReturn = validateReturn;
